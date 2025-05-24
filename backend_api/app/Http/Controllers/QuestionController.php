<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Mark;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class QuestionController extends Controller
{
    public function createQuestion(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'item_id' => 'required|exists:items,item_id',
                'question_category' => 'required|array|min:1',
                'choice' => 'required|array|min:1',
                'marks_caryy_that_choice' => [
                    'required',
                    'array',
                    function ($attribute, $value, $fail) use ($request) {
                        if (is_array($request->choice) && count($value) !== count($request->choice)) {
                            $fail('The ' . $attribute . ' array must have the same number of elements as the choice array.');
                        }
                    },
                ],
                'employee_id' => 'nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $question = Question::create([
                'item_id' => $request->item_id,
                'question_category' => $request->question_category,
                'choice' => $request->choice,
                'marks_caryy_that_choice' => $request->marks_caryy_that_choice,
                'user_id' => [Auth::id()], // Store user_id as array
                'employee_id' => $request->employee_id,
                'status' => 'pending',
                'marks_per_choice_attempted' => []
            ]);

            Log::info('Question created', ['question_id' => $question->question_id, 'user_id' => Auth::id()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Question created successfully',
                'data' => $question
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create question', ['error' => $e->getMessage(), 'user_id' => Auth::id() ?? 'unknown']);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create question',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateQuestion(Request $request, $question_id)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check() || !Auth::user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: User not authenticated'
                ], 401);
            }

            // Find the question
            $question = Question::find($question_id);
            if (!$question) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Question not found'
                ], 404);
            }

            // Check if the authenticated user has permission to edit
            if (!in_array(Auth::id(), $question->user_id)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: You do not have permission to edit this question'
                ], 403);
            }

            // Validate input (all fields optional, but enforce constraints if provided)
            $validator = Validator::make($request->all(), [
                'item_id' => 'sometimes|exists:items,item_id',
                'question_category' => 'sometimes|array|min:1',
                'question_category.*' => 'string|max:255',
                'choice' => 'sometimes|array|min:1',
                'choice.*' => 'string|max:255',
                'marks_caryy_that_choice' => [
                    'sometimes',
                    'array',
                    function ($attribute, $value, $fail) use ($request) {
                        if ($request->has('choice') && is_array($request->choice) && count($value) !== count($request->choice)) {
                            $fail('The ' . $attribute . ' array must have the same number of elements as the choice array.');
                        }
                    },
                ],
                'marks_caryy_that_choice.*' => 'numeric|min:0',
                'employee_id' => 'nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update only provided fields
            if ($request->has('item_id')) {
                $question->item_id = $request->item_id;
            }
            if ($request->has('question_category')) {
                $question->question_category = $request->question_category;
            }
            if ($request->has('choice')) {
                $question->choice = $request->choice;
            }
            if ($request->has('marks_caryy_that_choice')) {
                $question->marks_caryy_that_choice = $request->marks_caryy_that_choice;
            }
            if ($request->has('employee_id')) {
                $question->employee_id = $request->employee_id;
            }

            $question->updated_at = Carbon::now();
            $question->save();

            Log::info('Question updated', [
                'question_id' => $question->question_id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Question updated successfully',
                'data' => [
                    'question_id' => $question->question_id,
                    'item_id' => $question->item_id,
                    'question_category' => $question->question_category,
                    'choice' => $question->choice,
                    'marks_caryy_that_choice' => $question->marks_caryy_that_choice,
                    'marks_per_choice_attempted' => $question->marks_per_choice_attempted,
                    'user_id' => $question->user_id,
                    'employee_id' => $question->employee_id,
                    'status' => $question->status,
                    'created_at' => $question->created_at->toISOString(),
                    'updated_at' => $question->updated_at->toISOString()
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to update question', [
                'question_id' => $question_id,
                'user_id' => Auth::id() ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update question',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function attemptQuestion(Request $request, $question_id)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check() || !Auth::user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: User not authenticated'
                ], 401);
            }

            // Validate question_id exists in the questions table
            $question = Question::find($question_id);
            if (!$question) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Question not found for the provided question_id'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'choice_index' => 'required|integer|min:0',
                'employee_id' => 'nullable|exists:users,user_id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $role_id = $user->role_id;

            // Role-based validation for employee_id
            if ($role_id == 3 && $request->filled('employee_id')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Users with role_id 3 cannot provide employee_id'
                ], 403);
            }

            if ($role_id == 2 && !$request->filled('employee_id')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Users with role_id 2 must provide employee_id'
                ], 422);
            }

            // Validate employee_id has role_id = 3 when provided by role_id = 2
            if ($role_id == 2) {
                $employee = \App\Models\User::where('user_id', $request->employee_id)->first();
                if (!$employee || $employee->role_id != 3) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'The provided employee_id must belong to a user with role_id 3'
                    ], 422);
                }
            }

            if ($request->choice_index >= count($question->choice)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid choice index'
                ], 400);
            }

            $marks = $question->marks_caryy_that_choice[$request->choice_index];
            $attempt = [
                'user_id' => $role_id == 2 ? $request->employee_id : $user->user_id,
                'choice_index' => $request->choice_index,
                'marks' => $marks,
                'attempted_at' => Carbon::now()->toDateTimeString()
            ];

            $attempts = $question->marks_per_choice_attempted;
            $attempts[] = $attempt;
            $question->marks_per_choice_attempted = $attempts;
            $question->status = 'attempted';
            $question->user_id = array_unique(array_merge($question->user_id, [$role_id == 2 ? $request->employee_id : $user->user_id]));
            $question->employee_id = $request->employee_id ?? $question->employee_id;
            $question->updated_at = Carbon::now();
            $question->save();

            // Determine the user_id for the mark record
            $markUserId = $role_id == 2 ? $request->employee_id : $user->user_id;

            // Check if a mark record already exists
            $mark = Mark::where([
                'user_id' => $markUserId,
                'question_id' => $question->question_id
            ])->first();

            if ($mark) {
                // Update existing mark record
                $mark->total_marks += $marks;
                $mark->updated_at = Carbon::now();
                $mark->save();
            } else {
                // Create new mark record
                $mark = Mark::create([
                    'user_id' => $markUserId,
                    'question_id' => $question->question_id,
                    'total_marks' => $marks,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ]);
            }

            Log::info('Question attempted', [
                'question_id' => $question_id,
                'user_id' => $user->user_id,
                'marks' => $marks,
                'employee_id' => $request->employee_id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Question attempted successfully',
                'data' => [
                    'question' => [
                        'question_id' => $question->question_id,
                        'item_id' => $question->item_id,
                        'question_category' => $question->question_category,
                        'choice' => $question->choice,
                        'marks_caryy_that_choice' => $question->marks_caryy_that_choice,
                        'marks_per_choice_attempted' => $question->marks_per_choice_attempted,
                        'user_id' => $question->user_id,
                        'employee_id' => $question->employee_id,
                        'status' => $question->status,
                        'created_at' => $question->created_at->toISOString(),
                        'updated_at' => $question->updated_at->toISOString()
                    ],
                    'marks' => [
                        'mark_id' => $mark->id,
                        'user_id' => $mark->user_id,
                        'question_id' => $mark->question_id,
                        'total_marks' => $mark->total_marks,
                        'created_at' => $mark->created_at->toISOString(),
                        'updated_at' => $mark->updated_at->toISOString()
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to attempt question', [
                'question_id' => $question_id,
                'user_id' => Auth::id() ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to attempt question',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMarks(Request $request)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check() || !Auth::user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: User not authenticated'
                ], 401);
            }

            $marks = Mark::where('user_id', Auth::id())->get();

            Log::info('Marks retrieved', ['user_id' => Auth::id()]);

            return response()->json([
                'status' => 'success',
                'message' => 'Marks retrieved successfully',
                'data' => $marks
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve marks', ['user_id' => Auth::id() ?? 'unknown', 'error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve marks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllQuestions(Request $request)
    {
        try {
            $questions = Question::join('items', 'questions.item_id', '=', 'items.item_id')
                ->select('questions.*', 'items.item_category')
                ->get();

            $data = $questions->map(function ($question) {
                return [
                    'question_id' => $question->question_id,
                    'item_id' => $question->item_id,
                    'item_category' => $question->item_category,
                    'question_category' => $question->question_category,
                    'choice' => $question->choice,
                    'marks_caryy_that_choice' => $question->marks_caryy_that_choice,
                    'marks_per_choice_attempted' => $question->marks_per_choice_attempted,
                    'user_id' => $question->user_id,
                    'employee_id' => $question->employee_id,
                    'status' => $question->status,
                    'created_at' => $question->created_at->toISOString(),
                    'updated_at' => $question->updated_at->toISOString()
                ];
            });

            Log::info('All questions retrieved');

            return response()->json([
                'status' => 'success',
                'message' => 'Questions retrieved successfully',
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve questions', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve questions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   public function getAllMarksWithItem(Request $request)
{
    try {
        $marks = Mark::join('questions', 'marks.question_id', '=', 'questions.question_id')
            ->join('items', 'questions.item_id', '=', 'items.item_id')
            ->join('users', 'marks.user_id', '=', 'users.user_id') // Add join with users table
            ->select(
                'marks.*',
                'items.item_category',
                'questions.item_id',
                'users.name as user_name' // Select user name
            )
            ->get();

        $data = $marks->map(function ($mark) {
            return [
                'mark_id' => $mark->id,
                'user_id' => $mark->user_id,
                'user_name' => $mark->user_name, // Add user name to response
                'question_id' => $mark->question_id,
                'item_id' => $mark->item_id,
                'item_category' => $mark->item_category,
                'total_marks' => $mark->total_marks,
                'created_at' => $mark->created_at->toISOString(),
                'updated_at' => $mark->updated_at->toISOString()
            ];
        });

        Log::info('All marks with item category and user name retrieved');

        return response()->json([
            'status' => 'success',
            'message' => 'Marks with item category and user name retrieved successfully',
            'data' => $data
        ], 200);

    } catch (\Exception $e) {
        Log::error('Failed to retrieve marks with item category and user name', ['error' => $e->getMessage()]);
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve marks with item category and user name',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function getUserMarksWithCategory(Request $request)
{
    try {
        // Get authenticated user
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: User not authenticated'
            ], 401);
        }

        // Get the month from query parameter (format: YYYY-MM) or default to current month
        $month = $request->query('month', now()->format('Y-m'));
        $startOfMonth = \Carbon\Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $endOfMonth = \Carbon\Carbon::createFromFormat('Y-m', $month)->endOfMonth();

        // Fetch marks with related question and item data for the specified month
        $marks = Mark::where('employee_id', $user->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->with(['question' => function ($query) {
                $query->select('question_id', 'item_id', 'question_category', 'choice', 'marks_caryy_that_choice', 'status', 'created_at', 'updated_at')
                      ->with(['item' => function ($itemQuery) {
                          $itemQuery->select('item_id', 'item_category');
                      }]);
            }])
            ->select('mark_id', 'user_id', 'question_id', 'total_marks', 'created_at', 'updated_at')
            ->get();

        // Calculate total_kpi for the month
        $totalKpi = $marks->sum('total_marks');

        // Group marks by question_id
        $groupedMarks = $marks->groupBy('question_id')
            ->map(function ($markGroup, $questionId) use ($user) {
                $firstMark = $markGroup->first();
                $question = $firstMark->question;
                $totalMarks = $markGroup->sum('total_marks');

                // Aggregate marks per choice attempted
                $marksPerChoice = $markGroup->map(function ($mark) {
                    return [
                        'user_id' => $mark->user_id,
                        'choice_index' => $mark->choice_index ?? null,
                        'marks' => $mark->total_marks,
                        'attempted_at' => $mark->created_at->toDateTimeString()
                    ];
                })->values();

                return [
                    'mark_id' => $firstMark->mark_id,
                    'user_id' => $firstMark->user_id,
                    'user_name' => $user->name,
                    'question_id' => $questionId,
                    'item_id' => $question->item_id,
                    'item_category' => $question->item->item_category,
                    'question_category' => $question->question_category,
                    'choice' => $question->choice,
                    'marks_caryy_that_choice' => $question->marks_caryy_that_choice,
                    'marks_per_choice_attempted' => $marksPerChoice,
                    'employee_id' => $user->id,
                    'status' => $question->status,
                    'total_marks' => $totalMarks,
                    'created_at' => $firstMark->created_at->toDateTimeString(),
                    'updated_at' => $firstMark->updated_at->toDateTimeString()
                ];
            })->values();

        Log::info('User marks with category retrieved', [
            'user_id' => $user->id,
            'month' => $month,
            'marks_count' => $groupedMarks->count(),
            'total_kpi' => $totalKpi
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Marks with item category and user name retrieved successfully',
            'data' => [
                'marks' => $groupedMarks,
                'total_kpi' => $totalKpi,
                'month' => $month
            ]
        ], 200);

    } catch (\Exception $e) {
        Log::error('Failed to retrieve user marks with category', [
            'user_id' => Auth::id() ?? 'unknown',
            'month' => $request->query('month', 'unknown'),
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Failed to retrieve user marks with category',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}

    public function getUserQuestionsAndMarks(Request $request)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check() || !Auth::user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: User not authenticated'
                ], 401);
            }

            $user = Auth::user();
            $questions = Question::whereJsonContains('user_id', $user->user_id)
                ->join('items', 'questions.item_id', '=', 'items.item_id')
                ->with(['marks' => function ($query) use ($user) {
                    $query->where('user_id', $user->user_id);
                }])
                ->select(
                    'questions.*',
                    'items.item_category'
                )
                ->get();

            $data = $questions->map(function ($question) {
                return [
                    'question_id' => $question->question_id,
                    'item_id' => $question->item_id,
                    'item_category' => $question->item_category,
                    'question_category' => $question->question_category,
                    'choice' => $question->choice,
                    'marks_caryy_that_choice' => $question->marks_caryy_that_choice,
                    'marks_per_choice_attempted' => $question->marks_per_choice_attempted,
                    'user_id' => $question->user_id,
                    'employee_id' => $question->employee_id,
                    'status' => $question->status,
                    'created_at' => $question->created_at->toISOString(),
                    'updated_at' => $question->updated_at->toISOString(),
                    'marks' => $question->marks->map(function ($mark) {
                        return [
                            'mark_id' => $mark->id,
                            'user_id' => $mark->user_id,
                            'total_marks' => $mark->total_marks,
                            'created_at' => $mark->created_at->toISOString(),
                            'updated_at' => $mark->updated_at->toISOString()
                        ];
                    })
                ];
            });

            Log::info('User questions and marks retrieved', ['user_id' => $user->user_id]);

            return response()->json([
                'status' => 'success',
                'message' => 'User questions and marks retrieved successfully',
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve user questions and marks', [
                'user_id' => Auth::id() ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve user questions and marks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getQuestionsByItemId(Request $request, $item_id)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check() || !Auth::user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: User not authenticated'
                ], 401);
            }

            // Validate item_id exists in the items table
            $item = Item::find($item_id);
            if (!$item) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Item not found for the provided item_id'
                ], 404);
            }

            $questions = Question::where('item_id', $item_id)
                ->get()
                ->map(function ($question) {
                    return [
                        'question_id' => $question->question_id,
                        'item_id' => $question->item_id,
                        'question_category' => $question->question_category,
                        'choice' => $question->choice,
                        'marks_caryy_that_choice' => $question->marks_caryy_that_choice,
                        'marks_per_choice_attempted' => $question->marks_per_choice_attempted,
                        'user_id' => $question->user_id,
                        'employee_id' => $question->employee_id,
                        'status' => $question->status,
                        'created_at' => $question->created_at->toISOString(),
                        'updated_at' => $question->updated_at->toISOString()
                    ];
                });

            Log::info('Questions retrieved for item_id', [
                'item_id' => $item_id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Questions retrieved successfully for item_id',
                'data' => $questions
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve questions for item_id', [
                'item_id' => $item_id,
                'user_id' => Auth::id() ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve questions for item_id',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}