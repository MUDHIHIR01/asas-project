<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $primaryKey = 'question_id';

    protected $fillable = [
        'item_id',
        'question_category',
        'choice',
        'marks_caryy_that_choice',
        'user_id',
        'employee_id',
        'status',
        'marks_per_choice_attempted'
    ];

    protected $casts = [
        'question_category' => 'array',
        'choice' => 'array',
        'marks_caryy_that_choice' => 'array',
        'user_id' => 'array',
        'marks_per_choice_attempted' => 'array'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }
}