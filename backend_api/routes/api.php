<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\FtGroupController;
use App\Http\Controllers\LeadershipController;
use App\Http\Controllers\DiversityInclusionController;
use App\Http\Controllers\SustainabilityController;
use App\Http\Controllers\GivingBackController;
use App\Http\Controllers\FtPink130Controller;
use App\Http\Controllers\OurStandardController;
use App\Http\Controllers\SubStandardController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\FtHomeController;
use App\Http\Controllers\LeadershipHomeController;
use App\Http\Controllers\MclPink130Controller;
use App\Http\Controllers\MclHomeController;
use App\Http\Controllers\MclGroupController;
use App\Http\Controllers\DiversityHomeController;
use App\Http\Controllers\SustainabilityHomeController;
use App\Http\Controllers\GivingBackHomeController;
use App\Http\Controllers\FtPink130HomeController;
use App\Http\Controllers\Pink130Controller;

// Public Routes
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthorized user! Please login to access the API'], 401);
})->name('login');

// Authentication Routes
Route::post('/auth/add-user', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
// Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
// Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::post('/auth/request-reset', [PasswordResetController::class, 'requestPasswordReset']);
Route::post('/auth/password-reset', [PasswordResetController::class, 'resetPassword']);
Route::get('/slider-imgs', [AboutController::class, 'AboutSliders']); 
 Route::get('/homeSliders', [CompanyController::class, 'homeSliders']);
Route::get('/leadershipHomeSlider', [LeadershipHomeController::class, 'leadershipHomeSlider']);
 Route::get('/sliders', [MclHomeController::class, 'mclhmeSlider'])->name('mcl-home.sliders'); // Possibly a frontend slider endpoint
 Route::get('/latest', [MclGroupController::class, 'latest'])->name('mcl-groups.latest');
 Route::get('/d-and-inc/homeSlider', [DiversityHomeController::class, 'homeSlider']);
  Route::get('/sust/homeSlider', [SustainabilityHomeController::class, 'sustainabilityHomeSlider']);
   Route::get('/giving-back/slider', [GivingBackHomeController::class, 'givingBackHomeSlider']);
 
// Protected Routes
Route::middleware(['auth:sanctum', 'token.expiration'])->group(function () {
    // User Routes
    Route::get('/all/users', [AuthController::class, 'users']);
    Route::get('/users/byname', [AuthController::class, 'dropdownUsersByName']);
    Route::get('/users/byrole', [AuthController::class, 'dropdownUsersByRole']);
    Route::get('/user/profile', [AuthController::class, 'getLoggedUserProfile']);
    Route::get('/user/withrole', [AuthController::class, 'getUsersWithRoles']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    Route::get('/count/users', [AuthController::class, 'countUsers']);
    Route::get('/logged-user/name', [AuthController::class, 'getLoggedUserName']);
    Route::get('/user-dropdown', [AuthController::class, 'getUsersForDropdown']);
    Route::get('/user/{user_id}', [AuthController::class, 'showUserById']);
    Route::put('/update-user/{user_id}', [AuthController::class, 'updateUser']);
    Route::delete('/auth/user/{user_id}', [AuthController::class, 'deleteUser']);
    Route::get('/audit-trail', [AuthController::class, 'getAuditTrail']);
    Route::post('/store-cookies', [AuthController::class, 'storeCookies']);

    // Role Routes
    Route::apiResource('/auth/roles', RoleController::class);
    Route::get('/count/roles', [RoleController::class, 'countRoles']);
    Route::get('/roles/dropdown-options', [RoleController::class, 'getDropdownOptions']);

    // Company Routes
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/{company_id}', [CompanyController::class, 'show']);
    Route::post('/companies', [CompanyController::class, 'store']);
    Route::post('/companies/{company_id}', [CompanyController::class, 'update']); 
    Route::delete('/companies/{company_id}', [CompanyController::class, 'destroy']);



    // Leadership Routes
Route::get('/leadership', [LeadershipController::class, 'index']);
Route::get('/leadership/{leadership_id}', [LeadershipController::class, 'show']);
Route::post('/leadership', [LeadershipController::class, 'store']);
Route::post('/leadership/{leadership_id}/update', [LeadershipController::class, 'update']);
Route::delete('/leadership/{leadership_id}', [LeadershipController::class, 'destroy']);
Route::get('/latest/leadership', [LeadershipController::class, 'latest']);
    
    

Route::get('/diversity-inclusion/latest', [DiversityInclusionController::class, 'latest']);
Route::resource('diversity-inclusion', DiversityInclusionController::class);
Route::post('/diversity-inclusion/{diversity_id}/update', [DiversityInclusionController::class, 'update']);


Route::get('/sustainability', [SustainabilityController::class, 'index']);
Route::get('/sustainability/latest', [SustainabilityController::class, 'latest']);
Route::post('/sustainability', [SustainabilityController::class, 'store'])->middleware('auth:sanctum');
Route::get('/sustainability/{sustain_id}', [SustainabilityController::class, 'show']);
Route::post('/sustainability/{sustain_id}/update', [SustainabilityController::class, 'update']);
Route::put('/sustainability/{sustain_id}', [SustainabilityController::class, 'update']);
Route::delete('/sustainability/{sustain_id}', [SustainabilityController::class, 'destroy']);

Route::prefix('sustainability-homes')->group(function () {
    Route::get('/', [SustainabilityHomeController::class, 'index']);
    Route::get('/{sustainability_home_id}', [SustainabilityHomeController::class, 'show']);
    Route::post('/', [SustainabilityHomeController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{sustainability_home_id}', [SustainabilityHomeController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{sustainability_home_id}', [SustainabilityHomeController::class, 'destroy'])->middleware('auth:sanctum');
});


Route::get('/giving-back', [GivingBackController::class, 'index']);
Route::get('/giving-back/latest', [GivingBackController::class, 'latest']);
Route::post('/giving-back', [GivingBackController::class, 'store']);
Route::get('/giving-back/{giving_id}', [GivingBackController::class, 'show']);
Route::post('/giving-back/{giving_id}/update', [GivingBackController::class, 'update']);
Route::delete('/giving-back/{giving_id}', [GivingBackController::class, 'destroy']);


Route::prefix('giving-back-homes')->group(function () {
    Route::get('/', [GivingBackHomeController::class, 'index']);
    Route::get('/{giving_back_id}', [GivingBackHomeController::class, 'show']);
    Route::post('/', [GivingBackHomeController::class, 'store']);
    Route::put('/{giving_back_id}', [GivingBackHomeController::class, 'update']);
    Route::delete('/{giving_back_id}', [GivingBackHomeController::class, 'destroy']);
   
});

Route::get('/mcl-pink-130', [MclPink130Controller::class, 'index']);
Route::get('/mcl-pink-130/latest', [MclPink130Controller::class, 'latest']);
Route::post('/mcl-pink-130', [MclPink130Controller::class, 'store']);
Route::get('/mcl-pink-130/{mcl_id}', [MclPink130Controller::class, 'show']);
Route::post('/mcl-pink-130/{mcl_id}/update', [MclPink130Controller::class, 'update']);
Route::delete('/mcl-pink-130/{mcl_id}', [MclPink130Controller::class, 'destroy']);


Route::prefix('mcl-pink-130-home')->group(function () {
    Route::get('/', [FtPink130HomeController::class, 'index']);
    Route::get('/latest', [FtPink130HomeController::class, 'latest']);
    Route::post('/', [FtPink130HomeController::class, 'store']);
    Route::get('/{ft_pink_id}', [FtPink130HomeController::class, 'show']);
    Route::post('/{ft_pink_id}/update', [FtPink130HomeController::class, 'update']);
    Route::delete('/{ft_pink_id}', [FtPink130HomeController::class, 'destroy']);
});

Route::get('/our-standard', [OurStandardController::class, 'index']);
Route::get('/our-standard/latest', [OurStandardController::class, 'latest']);
Route::post('/our-standard', [OurStandardController::class, 'store'])->middleware('auth:sanctum');
Route::get('/our-standard/{our_id}', [OurStandardController::class, 'show']);
Route::post('/our-standard/{our_id}/update', [OurStandardController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/our-standard/{our_id}', [OurStandardController::class, 'destroy'])->middleware('auth:sanctum');


Route::get('/sub-standard', [SubStandardController::class, 'index']);
Route::get('/sub-standard/latest', [SubStandardController::class, 'latest']);
Route::post('/sub-standard', [SubStandardController::class, 'store'])->middleware('auth:sanctum');
Route::get('/sub-standard/{subStandard_id}', [SubStandardController::class, 'show']);
Route::post('/sub-standard/{subStandard_id}/update', [SubStandardController::class, 'update']);
Route::delete('/sub-standard/{subStandard_id}', [SubStandardController::class, 'destroy']);


Route::prefix('about')->group(function () {
    Route::get('/', [AboutController::class, 'index']); // Get all about entries
    Route::post('/', [AboutController::class, 'store']); // Create about entry
    Route::get('/{about_id}', [AboutController::class, 'show']); // Get single about entry
    Route::post('/{about_id}/update', [AboutController::class, 'update']); // Update about entry
    Route::delete('/{about_id}', [AboutController::class, 'destroy']); // Delete about entry
    Route::get('/count', [AboutController::class, 'countAbout']); // Count about entries
    Route::get('/dropdown', [AboutController::class, 'getDropdownOptions']); // Dropdown options
});




Route::get('/leadership-homes', [LeadershipHomeController::class, 'index']);
Route::get('/leadership-homes/slider', [LeadershipHomeController::class, 'leadershipHomeSlider']);
Route::get('/leadership-homes/{leadership_home_id}', [LeadershipHomeController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/leadership-homes', [LeadershipHomeController::class, 'store']);
    Route::put('/leadership-homes/{leadership_home_id}', [LeadershipHomeController::class, 'update']);
    Route::delete('/leadership-homes/{leadership_home_id}', [LeadershipHomeController::class, 'destroy']);
});


Route::prefix('mcl-home')->group(function () {
    Route::get('/', [MclHomeController::class, 'index'])->name('mcl-home.index'); // List all sliders
    Route::get('/sliders', [MclHomeController::class, 'mclhmeSlider'])->name('mcl-home.sliders'); // Possibly a frontend slider endpoint
    Route::get('/{mcl_home_id}', [MclHomeController::class, 'show'])->name('mcl-home.show'); // Fetch a single slider

    Route::post('/', [MclHomeController::class, 'store'])->name('mcl-home.store'); // Create a slider
    Route::post('/{mcl_home_id}', [MclHomeController::class, 'update'])->name('mcl-home.update'); // Update a slider
    Route::delete('/{mcl_home_id}', [MclHomeController::class, 'destroy'])->name('mcl-home.destroy'); // Delete a slider
});

Route::prefix('mcl-groups')->group(function () {
    Route::get('/', [MclGroupController::class, 'index'])->name('mcl-groups.index');
   
    Route::get('/all', [MclGroupController::class, 'allMclgroup'])->name('mcl-groups.all');
    Route::get('/{mcl_id}', [MclGroupController::class, 'show'])->name('mcl-groups.show');
    
 Route::post('/', [MclGroupController::class, 'store'])->name('mcl-groups.store');
        Route::post('/{mcl_id}', [MclGroupController::class, 'update'])->name('mcl-groups.update');
        Route::delete('/{mcl_id}', [MclGroupController::class, 'destroy'])->name('mcl-groups.destroy');
});


Route::prefix('diversity-home')->group(function () {
    Route::get('/', [DiversityHomeController::class, 'index']); // Get all diversity_home entries
    Route::post('/', [DiversityHomeController::class, 'store']); // Create diversity_home entry
    Route::get('/{dhome_id}', [DiversityHomeController::class, 'show']); // Get single diversity_home entry
    Route::post('/{dhome_id}/update', [DiversityHomeController::class, 'update']); // Update diversity_home entry
    Route::delete('/{dhome_id}', [DiversityHomeController::class, 'destroy']); // Delete diversity_home entry
    Route::get('/count', [DiversityHomeController::class, 'countDiversityHome']); // Count diversity_home entries
    Route::get('/dropdown', [DiversityHomeController::class, 'getDropdownOptions']); // Dropdown options
});




// API routes for Pink130 resource
Route::prefix('pink-130')->group(function () {
    Route::get('/', [Pink130Controller::class, 'index'])->name('pink130.index');
    Route::get('/latest', [Pink130Controller::class, 'latest'])->name('pink130.latest');
    Route::get('/{pink_id}', [Pink130Controller::class, 'show'])->name('pink130.show');
    
    // Protected routes requiring authentication
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [Pink130Controller::class, 'store'])->name('pink130.store');
        Route::post('/{pink_id}/update', [Pink130Controller::class, 'update'])->name('pink130.update');
        Route::delete('/{pink_id}', [Pink130Controller::class, 'destroy'])->name('pink130.destroy');
    });
});





});

