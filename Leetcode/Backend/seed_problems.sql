-- seed_problems.sql - Insert 20 LeetCode-like problems

INSERT INTO problems (title, description, difficulty, category, examples, test_cases, constraints) 
VALUES 

-- Easy Problems
(
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'Easy',
  'Array',
  '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}]',
  '[{"nums": [2,7,11,15], "target": 9, "expected": "[0,1]"}]',
  '2 <= nums.length <= 10^4'
),

(
  'Reverse String',
  'Write a function that reverses a string. The input string is given as an array of characters s.',
  'Easy',
  'String',
  '[{"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"}]',
  '[{"s": ["h","e","l","l","o"], "expected": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"}]',
  '1 <= s.length <= 10^5'
),

(
  'Valid Parentheses',
  'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
  'Easy',
  'Stack',
  '[{"input": "s = \"()\"", "output": "true"}]',
  '[{"s": "()", "expected": "true"}]',
  '1 <= s.length <= 10^4'
),

(
  'Palindrome Number',
  'Given an integer x, return true if x is palindrome integer.',
  'Easy',
  'Math',
  '[{"input": "x = 121", "output": "true"}]',
  '[{"x": 121, "expected": "true"}]',
  '-2^31 <= x <= 2^31 - 1'
),

(
  'Contains Duplicate',
  'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
  'Easy',
  'Hash Table',
  '[{"input": "nums = [1,2,3,1]", "output": "true"}]',
  '[{"nums": [1,2,3,1], "expected": "true"}]',
  '1 <= nums.length <= 10^5'
),

-- Medium Problems
(
  'Longest Substring Without Repeating Characters',
  'Given a string s, find the length of the longest substring without repeating characters.',
  'Medium',
  'String',
  '[{"input": "s = \"abcabcbb\"", "output": "3"}]',
  '[{"s": "abcabcbb", "expected": "3"}]',
  '0 <= s.length <= 5 * 10^4'
),

(
  'Add Two Numbers',
  'You are given two non-empty linked lists representing two non-negative integers.',
  'Medium',
  'Linked List',
  '[{"input": "l1 = [2,4,3], l2 = [5,6,4]", "output": "[7,0,8]"}]',
  '[{"l1": [2,4,3], "l2": [5,6,4], "expected": "[7,0,8]"}]',
  'The number of nodes in each linked list is in the range [1, 100]'
),

(
  '3Sum',
  'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
  'Medium',
  'Array',
  '[{"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"}]',
  '[{"nums": [-1,0,1,2,-1,-4], "expected": "[[-1,-1,2],[-1,0,1]]"}]',
  '3 <= nums.length <= 3000'
),

(
  'Remove Duplicates from Sorted Array',
  'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place.',
  'Easy',
  'Array',
  '[{"input": "nums = [1,1,2]", "output": "2"}]',
  '[{"nums": [1,1,2], "expected": "2"}]',
  '1 <= nums.length <= 3 * 10^4'
),

(
  'Merge Sorted Array',
  'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n representing the number of valid elements in nums1 and nums2 respectively.',
  'Easy',
  'Array',
  '[{"input": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", "output": "[1,2,2,3,5,6]"}]',
  '[{"nums1": [1,2,3,0,0,0], "m": 3, "nums2": [2,5,6], "n": 3, "expected": "[1,2,2,3,5,6]"}]',
  'nums1.length == m + n'
),

-- Hard Problems
(
  'Median of Two Sorted Arrays',
  'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
  'Hard',
  'Array',
  '[{"input": "nums1 = [1,3], nums2 = [2]", "output": "2.0"}]',
  '[{"nums1": [1,3], "nums2": [2], "expected": "2.0"}]',
  'nums1.length == m, nums2.length == n'
),

(
  'Regular Expression Matching',
  'Given an input string s and a pattern p, implement regular expression matching with support for "." and "*".',
  'Hard',
  'String',
  '[{"input": "s = \"aa\", p = \"a\"", "output": "false"}]',
  '[{"s": "aa", "p": "a", "expected": "false"}]',
  '1 <= s.length <= 20, 1 <= p.length <= 30'
),

(
  'Trapping Rain Water',
  'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
  'Hard',
  'Array',
  '[{"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"}]',
  '[{"height": [0,1,0,2,1,0,1,3,2,1,2,1], "expected": "6"}]',
  'n == height.length, 1 <= n <= 2 * 10^4'
);