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
    ];

    protected $casts = [
        'question_category' => 'array', // Automatically cast JSON to array
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id', 'item_id');
    }
}