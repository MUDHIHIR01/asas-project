<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $primaryKey = 'answer_id';

    protected $fillable = [
        'user_id',
        'question_id',
        'category_answers',
        'marks_scored',
        'total_marks',
    ];

    protected $casts = [
        'category_answers' => 'array', // Automatically cast JSON to array
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id', 'question_id');
    }
}