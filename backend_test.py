#!/usr/bin/env python3
"""
Backend API Testing for Rubber Track Compatibility Chart
Tests the track-sizes, compatibility, and compatibility/search endpoints
"""

import requests
import json
import sys
from typing import Dict, List, Any

# Get backend URL from frontend env
BACKEND_URL = "https://trackfinder-5.preview.emergentagent.com/api"

def test_track_sizes_api():
    """Test GET /api/track-sizes endpoint"""
    print("🔍 Testing GET /api/track-sizes...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/track-sizes", timeout=30)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ FAILED: Expected 200, got {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        data = response.json()
        print(f"   ✅ SUCCESS: Received {len(data)} track sizes")
        
        # Verify data structure
        if not data:
            print("   ❌ FAILED: No track sizes returned")
            return False
            
        # Check first item structure
        first_item = data[0]
        required_fields = ['size', 'width', 'pitch', 'links']
        missing_fields = [field for field in required_fields if field not in first_item]
        
        if missing_fields:
            print(f"   ❌ FAILED: Missing required fields: {missing_fields}")
            print(f"   Sample item: {json.dumps(first_item, indent=2)}")
            return False
            
        print(f"   ✅ Data structure valid - has required fields: {required_fields}")
        
        # Check if we have expected number of track sizes (around 359)
        if len(data) < 300:
            print(f"   ⚠️  WARNING: Expected ~359 track sizes, got {len(data)}")
        else:
            print(f"   ✅ Track size count looks good: {len(data)}")
            
        # Sample a few items to verify data quality
        print("   📋 Sample track sizes:")
        for i, item in enumerate(data[:3]):
            print(f"      {i+1}. Size: {item.get('size')}, Width: {item.get('width')}mm, Pitch: {item.get('pitch')}mm, Links: {item.get('links')}")
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAILED: Request error - {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"   ❌ FAILED: JSON decode error - {e}")
        return False
    except Exception as e:
        print(f"   ❌ FAILED: Unexpected error - {e}")
        return False


def test_compatibility_api():
    """Test GET /api/compatibility endpoint"""
    print("\n🔍 Testing GET /api/compatibility...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/compatibility", timeout=30)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ FAILED: Expected 200, got {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        data = response.json()
        print(f"   ✅ SUCCESS: Received {len(data)} compatibility entries")
        
        # Verify data structure
        if not data:
            print("   ❌ FAILED: No compatibility entries returned")
            return False
            
        # Check first item structure
        first_item = data[0]
        required_fields = ['make', 'model', 'track_sizes']
        missing_fields = [field for field in required_fields if field not in first_item]
        
        if missing_fields:
            print(f"   ❌ FAILED: Missing required fields: {missing_fields}")
            print(f"   Sample item: {json.dumps(first_item, indent=2)}")
            return False
            
        print(f"   ✅ Data structure valid - has required fields: {required_fields}")
        
        # Check if we have expected number of compatibility entries (around 4727)
        if len(data) < 4000:
            print(f"   ⚠️  WARNING: Expected ~4727 compatibility entries, got {len(data)}")
        else:
            print(f"   ✅ Compatibility entry count looks good: {len(data)}")
            
        # Sample a few items to verify data quality
        print("   📋 Sample compatibility entries:")
        for i, item in enumerate(data[:3]):
            track_sizes = item.get('track_sizes', [])
            track_count = len(track_sizes) if isinstance(track_sizes, list) else 1
            print(f"      {i+1}. Make: {item.get('make')}, Model: {item.get('model')}, Track Sizes: {track_count}")
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAILED: Request error - {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"   ❌ FAILED: JSON decode error - {e}")
        return False
    except Exception as e:
        print(f"   ❌ FAILED: Unexpected error - {e}")
        return False


def test_compatibility_search_api():
    """Test GET /api/compatibility/search?make=Bobcat endpoint"""
    print("\n🔍 Testing GET /api/compatibility/search?make=Bobcat...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/compatibility/search?make=Bobcat", timeout=30)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ FAILED: Expected 200, got {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        data = response.json()
        print(f"   ✅ SUCCESS: Received {len(data)} Bobcat compatibility entries")
        
        # Verify data structure
        if not data:
            print("   ❌ FAILED: No Bobcat compatibility entries returned")
            return False
            
        # Verify all entries are for Bobcat
        non_bobcat_entries = [item for item in data if 'bobcat' not in item.get('make', '').lower()]
        if non_bobcat_entries:
            print(f"   ❌ FAILED: Found {len(non_bobcat_entries)} non-Bobcat entries in search results")
            return False
            
        print(f"   ✅ All {len(data)} entries are for Bobcat machines")
        
        # Sample a few items to verify data quality
        print("   📋 Sample Bobcat compatibility entries:")
        for i, item in enumerate(data[:5]):
            track_sizes = item.get('track_sizes', [])
            track_count = len(track_sizes) if isinstance(track_sizes, list) else 1
            print(f"      {i+1}. Make: {item.get('make')}, Model: {item.get('model')}, Track Sizes: {track_count}")
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAILED: Request error - {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"   ❌ FAILED: JSON decode error - {e}")
        return False
    except Exception as e:
        print(f"   ❌ FAILED: Unexpected error - {e}")
        return False


def test_data_consistency():
    """Test data consistency between track-sizes and compatibility endpoints"""
    print("\n🔍 Testing data consistency between track-sizes and compatibility...")
    
    try:
        # Get track sizes
        track_sizes_response = requests.get(f"{BACKEND_URL}/track-sizes", timeout=30)
        if track_sizes_response.status_code != 200:
            print("   ❌ FAILED: Could not fetch track sizes for consistency check")
            return False
            
        track_sizes_data = track_sizes_response.json()
        available_sizes = {item.get('size') for item in track_sizes_data if item.get('size')}
        print(f"   📊 Found {len(available_sizes)} unique track sizes")
        
        # Get compatibility data (sample first 100 entries for performance)
        compatibility_response = requests.get(f"{BACKEND_URL}/compatibility", timeout=30)
        if compatibility_response.status_code != 200:
            print("   ❌ FAILED: Could not fetch compatibility data for consistency check")
            return False
            
        compatibility_data = compatibility_response.json()
        
        # Check consistency for first 50 entries (to avoid timeout)
        sample_entries = compatibility_data[:50]
        inconsistent_entries = []
        
        for entry in sample_entries:
            track_sizes = entry.get('track_sizes', [])
            if isinstance(track_sizes, list):
                for size in track_sizes:
                    if size not in available_sizes:
                        inconsistent_entries.append({
                            'make': entry.get('make'),
                            'model': entry.get('model'),
                            'missing_size': size
                        })
        
        if inconsistent_entries:
            print(f"   ⚠️  WARNING: Found {len(inconsistent_entries)} inconsistent track size references in sample")
            print("   📋 Sample inconsistent entries:")
            for entry in inconsistent_entries[:3]:
                print(f"      - {entry['make']} {entry['model']} references missing size: {entry['missing_size']}")
        else:
            print(f"   ✅ Data consistency check passed for sample of {len(sample_entries)} entries")
            
        return len(inconsistent_entries) == 0
        
    except Exception as e:
        print(f"   ❌ FAILED: Consistency check error - {e}")
        return False


def test_additional_search_scenarios():
    """Test additional search scenarios"""
    print("\n🔍 Testing additional search scenarios...")
    
    test_cases = [
        ("make=Caterpillar", "Caterpillar"),
        ("make=John", "John"),  # Should match John Deere
        ("model=T190", "T190"),
    ]
    
    all_passed = True
    
    for query, expected_term in test_cases:
        try:
            print(f"   Testing search: {query}")
            response = requests.get(f"{BACKEND_URL}/compatibility/search?{query}", timeout=30)
            
            if response.status_code != 200:
                print(f"      ❌ FAILED: Status {response.status_code}")
                all_passed = False
                continue
                
            data = response.json()
            print(f"      ✅ SUCCESS: Found {len(data)} results for {query}")
            
            # Verify results contain expected term
            if data and expected_term.lower() not in str(data[0]).lower():
                print(f"      ⚠️  WARNING: Results may not match search term '{expected_term}'")
                
        except Exception as e:
            print(f"      ❌ FAILED: Error testing {query} - {e}")
            all_passed = False
            
    return all_passed


def main():
    """Run all backend API tests"""
    print("🚀 Starting Backend API Tests for Rubber Track Compatibility Chart")
    print("=" * 70)
    
    test_results = []
    
    # Test individual endpoints
    test_results.append(("Track Sizes API", test_track_sizes_api()))
    test_results.append(("Compatibility API", test_compatibility_api()))
    test_results.append(("Compatibility Search API", test_compatibility_search_api()))
    test_results.append(("Data Consistency", test_data_consistency()))
    test_results.append(("Additional Search Scenarios", test_additional_search_scenarios()))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    passed_tests = 0
    total_tests = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<30} {status}")
        if result:
            passed_tests += 1
    
    print(f"\nOverall Result: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! The Rubber Track Compatibility Chart APIs are working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the detailed output above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())