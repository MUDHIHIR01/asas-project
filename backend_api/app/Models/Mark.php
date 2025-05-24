<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mark extends Model
{
    use HasFactory;

    protected $primaryKey = 'mark_id';

    protected $fillable = [
        'user_id',
        'employee_id',
        'total_marks',
        'question_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function question()
{
    return $this->belongsTo(Question::class, 'question_id','question_id');
}
}