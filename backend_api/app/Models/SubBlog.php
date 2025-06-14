<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubBlog extends Model
{
    use HasFactory;

    protected $primaryKey = 'sublog_id';

    protected $fillable = [
        'heading',
        'description',
        'video_file',
        'image_file',
        'url_link',
    ];
}