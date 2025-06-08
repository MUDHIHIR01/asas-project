<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OurStandard extends Model
{
    protected $table = 'our_standard';
    protected $primaryKey = 'our_id';

    protected $fillable = [
        'home_page',
        'standard_category',
        'standard_file',
        'weblink',
        'description',
    ];
}
