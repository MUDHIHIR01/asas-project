<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    

    /**
     * Display a listing of the questions.
     */
    public function index()
    {
        try {
            $questions = Question::with('item')->orderBy('question_id', 'desc')->get();
            return response()->json([
                'questions' => $questions,
                'message' => 'Questions retrieved successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching questions: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch questions.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function LoggedUserItem()
    {
        try {
            $user = auth()->user(); // Get the logged-in user
            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized. Please log in.'
                ], 401);
            }
    
            $questions = Question::with('item')
                ->where('item_id', $user->item_id) // Match questions with user's item_id
                ->where('status', 'pending') // Filter for pending status
                ->orderBy('question_id', 'desc')
                ->get();
    
            return response()->json([
                'questions' => $questions,
                'message' => 'Pending questions for logged-in user retrieved successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching pending questions for logged-in user: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch pending questions.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new question (optional for API).
     */
    public function create()
    {
        return response()->json([
            'message' => 'Create question form.'
        ], 200);
    }

    /**
     * Store a newly created question in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item_id' => 'required|exists:items,item_id',
            'question_category' => 'required|array|min:1',
            'question_category.*' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $questionData = [
                'item_id' => $request->item_id,
                'question_category' => $request->question_category, // JSON encoded automatically
            ];

            $question = Question::create($questionData);

            // Find users with matching item_id
            $users = User::where('item_id', $request->item_id)->get();

            // Send email notification to each matched user
            foreach ($users as $user) {
                // Generate login link
                $loginLink = url('http://localhost:5173/');

                // Prepare email content
                $emailBody = "Dear {$user->name},\n\n" .
                             "New questions have been posted to your item. Please log in to review and answer:\n" .
                             "{$loginLink}\n\n" .
                             "Thank you!";

                // Attempt to send email
                try {
                    Mail::raw($emailBody, function ($message) use ($user) {
                        $message->to($user->email)
                                ->subject('New Questions Posted to Your Item');
                    });
                } catch (\Exception $e) {
                    Log::error('Email sending failed for user ' . $user->email . ': ' . $e->getMessage());
                    // Continue with the next user, don't interrupt the loop
                }
            }

            return response()->json([
                'question' => $question,
                'message' => 'Question created successfully. Notifications sent to relevant users.'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating question: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create question.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified question.
     */
    public function show($question_id)
    {
        try {
            $question = Question::with('item')->find($question_id);
            if (!$question) {
                return response()->json([
                    'message' => 'Question not found.'
                ], 404);
            }
            return response()->json([
                'question' => $question,
                'message' => 'Question retrieved successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching question: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch question.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified question (optional for API).
     */
    public function edit($question_id)
    {
        try {
            $question = Question::find($question_id);
            if (!$question) {
                return response()->json([
                    'message' => 'Question not found.'
                ], 404);
            }
            return response()->json([
                'question' => $question,
                'message' => 'Edit question form.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching question for edit: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch question.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified question in storage.
     */
    public function update(Request $request, $question_id)
    {
        $validator = Validator::make($request->all(), [
            'item_id' => 'required|exists:items,item_id',
            'question_category' => 'required|array|min:1',
            'question_category.*' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $question = Question::find($question_id);
            if (!$question) {
                return response()->json([
                    'message' => 'Question not found.'
                ], 404);
            }

            $question->update([
                'item_id' => $request->item_id,
                'question_category' => $request->question_category,
            ]);

            return response()->json([
                'question' => $question,
                'message' => 'Question updated successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating question: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update question.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified question from storage.
     */
    public function destroy($question_id)
    {
        try {
            $question = Question::find($question_id);
            if (!$question) {
                return response()->json([
                    'message' => 'Question not found.'
                ], 404);
            }

            $question->delete();

            return response()->json([
                'message' => 'Question deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting question: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete question.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}