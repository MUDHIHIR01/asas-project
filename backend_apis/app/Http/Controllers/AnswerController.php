<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Question;
use App\Models\User; // Added for user lookup
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail; // Added for email sending

class AnswerController extends Controller
{
    

    /**
     * Display a listing of the answers.
     */
    public function index()
    {
        try {
            $answers = Answer::with(['user', 'question'])->orderBy('answer_id', 'desc')->get();
            return response()->json([
                'answers' => $answers,
                'message' => 'Answers retrieved successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching answers: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch answers.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new answer (optional for API).
     */
    public function create()
    {
        return response()->json([
            'message' => 'Create answer form.'
        ], 200);
    }

    /**
     * Store a newly created answer in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,user_id',
            'question_id' => 'required|exists:questions,question_id',
            'category_answers' => 'required|array|min:1',
            'category_answers.*.category' => 'required|string|max:255',
            'category_answers.*.answer' => 'required|string',
            'total_marks' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Ensure the authenticated user matches the provided user_id
            $authUser = Auth::user();
            if ($authUser->user_id != $request->user_id) {
                return response()->json([
                    'message' => 'Unauthorized: Provided user_id does not match authenticated user.'
                ], 403);
            }

            // Fetch the question to validate question_category
            $question = Question::find($request->question_id);
            $questionCategories = $question->question_category;

            // Validate that category_answers match the question's question_category
            $submittedCategories = collect($request->category_answers)->pluck('category')->toArray();
            if (!empty(array_diff($submittedCategories, $questionCategories)) || !empty(array_diff($questionCategories, $submittedCategories))) {
                return response()->json([
                    'message' => 'Category answers must match the question\'s categories: ' . implode(', ', $questionCategories)
                ], 422);
            }

            $answerData = [
                'user_id' => $request->user_id,
                'question_id' => $request->question_id,
                'category_answers' => $request->category_answers,
                'marks_scored' => null,
                'total_marks' => $request->total_marks,
            ];

            $answer = Answer::create($answerData);

            // Find users to notify (e.g., users related to the question's item_id)
            $question = Question::find($request->question_id);
            $users = User::where('item_id', $question->item_id)->get();

            // Send email notification to each matched user
            foreach ($users as $user) {
                // Generate login link
                $loginLink = url('http://localhost:5173/'); // Adjust URL as needed

                // Prepare email content
                $emailBody = "Dear {$user->name},\n\n" .
                             "New KPI Performances have been posted to your account. Please log in to review:\n" .
                             "{$loginLink}\n\n" .
                             "Thank you!";

                // Attempt to send email
                try {
                    Mail::raw($emailBody, function ($message) use ($user) {
                        $message->to($user->email)
                                ->subject('New KPI Performances Posted to Your Account');
                    });
                } catch (\Exception $e) {
                    Log::error('Email sending failed for user ' . $user->email . ': ' . $e->getMessage());
                    // Continue with the next user
                }
            }

            return response()->json([
                'answer' => $answer,
                'message' => 'Answer created successfully. Notifications sent to relevant users.'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating answer: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create answer.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified answer.
     */
    public function show($answer_id)
    {
        try {
            $answer = Answer::with(['user', 'question'])->find($answer_id);
            if (!$answer) {
                return response()->json([
                    'message' => 'Answer not found.'
                ], 404);
            }
            return response()->json([
                'answer' => $answer,
                'message' => 'Answer retrieved successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching answer: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch answer.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified answer (optional for API).
     */
    public function edit($answer_id)
    {
        try {
            $answer = Answer::find($answer_id);
            if (!$answer) {
                return response()->json([
                    'message' => 'Answer not found.'
                ], 404);
            }
            return response()->json([
                'answer' => $answer,
                'message' => 'Edit answer form.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching answer for edit: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch answer.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified answer in storage.
     */
    public function update(Request $request, $answer_id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,user_id',
            'question_id' => 'required|exists:questions,question_id',
            'category_answers' => 'required|array|min:1',
            'category_answers.*.category' => 'required|string|max:255',
            'category_answers.*.answer' => 'required|string',
            'total_marks' => 'required|integer|min:1',
            'marks_scored' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Ensure the authenticated user matches the provided user_id
            $authUser = Auth::user();
            if ($authUser->user_id != $request->user_id) {
                return response()->json([
                    'message' => 'Unauthorized: Provided user_id does not match authenticated user.'
                ], 403);
            }

            $answer = Answer::find($answer_id);
            if (!$answer) {
                return response()->json([
                    'message' => 'Answer not found.'
                ], 404);
            }

            // Fetch the question to validate question_category
            $question = Question::find($request->question_id);
            $questionCategories = $question->question_category;

            // Validate that category_answers match the question's question_category
            $submittedCategories = collect($request->category_answers)->pluck('category')->toArray();
            if (!empty(array_diff($submittedCategories, $questionCategories)) || !empty(array_diff($questionCategories, $submittedCategories))) {
                return response()->json([
                    'message' => 'Category answers must match the question\'s categories: ' . implode(', ', $questionCategories)
                ], 422);
            }

            $answer->update([
                'user_id' => $request->user_id,
                'question_id' => $request->question_id,
                'category_answers' => $request->category_answers,
                'marks_scored' => $request->marks_scored,
                'total_marks' => $request->total_marks,
            ]);

            return response()->json([
                'answer' => $answer,
                'message' => 'Answer updated successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating answer: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update answer.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified answer from storage.
     */
    public function destroy($answer_id)
    {
        try {
            $answer = Answer::find($answer_id);
            if (!$answer) {
                return response()->json([
                    'message' => 'Answer not found.'
                ], 404);
            }

            $answer->delete();

            return response()->json([
                'message' => 'Answer deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting answer: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete answer.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}