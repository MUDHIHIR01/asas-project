<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ItemController extends Controller
{
    /**
     * Display a listing of the items.
     */
    public function index()
    {
        try {
            $items = Item::orderBy('item_id', 'desc')->get();
            return response()->json([
                'items' => $items,
                'message' => 'Items retrieved successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching items: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch items.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new item (optional for API).
     */
    public function create()
    {
        // For API, this might not be needed, but included for completeness
        return response()->json([
            'message' => 'Create item form.'
        ], 200);
    }

    /**
     * Store a newly created item in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item_category' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $item = Item::create($request->only(['item_category']));
            return response()->json([
                'item' => $item,
                'message' => 'Item created successfully.'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating item: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified item.
     */
    public function show($item_id)
    {
        try {
            $item = Item::find($item_id);
            if (!$item) {
                return response()->json([
                    'message' => 'Item not found.'
                ], 404);
            }
            return response()->json([
                'item' => $item,
                'message' => 'Item retrieved successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching item: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified item (optional for API).
     */
    public function edit($item_id)
    {
        // For API, this might not be needed, but included for completeness
        try {
            $item = Item::find($item_id);
            if (!$item) {
                return response()->json([
                    'message' => 'Item not found.'
                ], 404);
            }
            return response()->json([
                'item' => $item,
                'message' => 'Edit item form.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching item for edit: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified item in storage.
     */
    public function update(Request $request, $item_id)
    {
        $validator = Validator::make($request->all(), [
            'item_category' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $item = Item::find($item_id);
            if (!$item) {
                return response()->json([
                    'message' => 'Item not found.'
                ], 404);
            }

            $item->update($request->only(['item_category']));
            return response()->json([
                'item' => $item,
                'message' => 'Item updated successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating item: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified item from storage.
     */
    public function destroy($item_id)
    {
        try {
            $item = Item::find($item_id);
            if (!$item) {
                return response()->json([
                    'message' => 'Item not found.'
                ], 404);
            }

            $item->delete();
            return response()->json([
                'message' => 'Item deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting item: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}