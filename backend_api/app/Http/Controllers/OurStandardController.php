
<?php

namespace App\Http\Controllers;

use App\Models\OurStandard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Exception;

class OurStandardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }

    /**
     * Display a listing of our standard records.
     */
    public function index()
    {
        try {
            $ourStandardRecords = OurStandard::orderBy('our_id', 'desc')->get();
            return response()->json(['our_standard' => $ourStandardRecords], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching our standard records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch our standard records.'], 500);
        }
    }

    /**
     * Display the latest our standard record based on created_at.
     */
    public function latest()
    {
        try {
            $latestOurStandard = OurStandard::orderBy('created_at', 'desc')->first();
            if (!$latestOurStandard) {
                return response()->json(['message' => 'No Our Standard record found'], 404);
            }
            return response()->json(['our_standard' => $latestOurStandard], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching latest our standard record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch latest our standard record.'], 500);
        }
    }

    /**
     * Store a newly created our standard record.
     */
    public function store(Request $request)
    {
        \Log::info('Our Standard store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'home_page' => 'nullable|string|max:255',
            'standard_category' => 'required|string|max:255',
            'standard_file' => 'nullable|file|mimes:pdf,xls,xlsx|max:2048',
            'weblink' => 'nullable|url|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for Our Standard store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            // Handle standard_file upload (PDF or Excel)
            if ($request->hasFile('standard_file') && $request->file('standard_file')->isValid()) {
                $filePath = $request->file('standard_file')->store('standard_files', 'public');
                $data['standard_file'] = $filePath;
                \Log::info('File uploaded: ' . $filePath);
            }

            $ourStandard = OurStandard::create($data);
            return response()->json(['message' => 'Our Standard record created successfully', 'our_standard' => $ourStandard], 201);
        } catch (Exception $e) {
            \Log::error('Error creating our standard record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create our standard record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified our standard record.
     */
    public function show($our_id)
    {
        $ourStandard = OurStandard::find($our_id);
        if (!$ourStandard) {
            return response()->json(['message' => 'Our Standard record not found'], 404);
        }
        return response()->json(['our_standard' => $ourStandard], 200);
    }

    /**
     * Update the specified our standard record using POST.
     */
    public function update(Request $request, $our_id)
    {
        \Log::info('Our Standard update request data for ID ' . $our_id . ': ', $request->all());

        $ourStandard = OurStandard::find($our_id);
        if (!$ourStandard) {
            \Log::warning('Our Standard record not found for ID: ' . $our_id);
            return response()->json(['message' => 'Our Standard record not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'home_page' => 'nullable|string|max:255',
            'standard_category' => 'required|string|max:255',
            'standard_file' => 'nullable|file|mimes:pdf,xls,xlsx|max:2048',
            'weblink' => 'nullable|url|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for Our Standard update ID ' . $our_id . ': ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            \Log::info('Validated data for update ID ' . $our_id . ': ', $data);

            // Handle standard_file upload (PDF or Excel)
            if ($request->hasFile('standard_file') && $request->file('standard_file')->isValid()) {
                // Delete old file if it exists
                if ($ourStandard->standard_file && Storage::disk('public')->exists($ourStandard->standard_file)) {
                    Storage::disk('public')->delete($ourStandard->standard_file);
                    \Log::info('Deleted old file: ' . $ourStandard->standard_file);
                }
                $filePath = $request->file('standard_file')->store('standard_files', 'public');
                $data['standard_file'] = $filePath;
                \Log::info('New file uploaded: ' . $filePath);
            } else {
                $data['standard_file'] = $ourStandard->standard_file;
                \Log::info('No new file uploaded, preserving existing: ' . ($ourStandard->standard_file ?: 'none'));
            }

            $ourStandard->fill($data)->save();
            \Log::info('Our Standard record updated successfully for ID: ' . $our_id);
            return response()->json([
                'message' => 'Our Standard record updated successfully.',
                'our_standard' => $ourStandard->fresh()
            ], 200);
        } catch (Exception $e) {
            \Log::error('Error updating our standard record for ID ' . $our_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update our standard record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified our standard record.
     */
    public function destroy($our_id)
    {
        $ourStandard = OurStandard::find($our_id);
        if (!$ourStandard) {
            \Log::warning('Our Standard record not found for ID: ' . $our_id);
            return response()->json(['message' => 'Our Standard record not found'], 404);
        }

        try {
            // Delete standard_file if it exists
            if ($ourStandard->standard_file && Storage::disk('public')->exists($ourStandard->standard_file)) {
                Storage::disk('public')->delete($ourStandard->standard_file);
                \Log::info('Deleted file: ' . $ourStandard->standard_file);
            }

            $ourStandard->delete();
            \Log::info('Our Standard record deleted successfully for ID: ' . $our_id);
            return response()->json(['message' => 'Our Standard record deleted successfully'], 200);
        } catch (Exception $e) {
            \Log::error('Error deleting our standard record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete our standard record.', 'details' => $e->getMessage()], 500);
        }
    }
}
