export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: LessonContent;
}

export interface LessonContent {
  explanation: string;
  keyPoints: string[];
  interactionType: 'observe' | 'build' | 'traverse' | 'quiz';
  initialState?: any;
  targetState?: any;
  hints?: string[];
}

export const binaryTreeLessons: Lesson[] = [
  {
    id: 'bt-1',
    title: 'What is a Binary Tree?',
    description: 'Introduction to binary trees and their basic structure',
    content: {
      explanation: 'A Binary Tree is a hierarchical data structure where each node has at most two children, referred to as the left child and right child. The topmost node is called the root.',
      keyPoints: [
        'Each node contains data and references to two children',
        'The root is the topmost node with no parent',
        'Leaf nodes have no children',
        'Binary trees are used in searching, sorting, and expression parsing'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 10,
        left: { id: '2', value: 5, left: { id: '4', value: 3 }, right: { id: '5', value: 7 } },
        right: { id: '3', value: 15, left: { id: '6', value: 12 }, right: { id: '7', value: 20 } }
      }
    }
  },
  {
    id: 'bt-2',
    title: 'Nodes, Edges, and Levels',
    description: 'Understanding the components of a binary tree',
    content: {
      explanation: 'A node is a fundamental unit containing data. An edge connects a parent to a child. The level of a node is its distance from the root (root is level 0). The height of the tree is the maximum level.',
      keyPoints: [
        'Node: Contains value and child pointers',
        'Edge: Connection between parent and child',
        'Level: Distance from root (root = level 0)',
        'Height: Maximum level in the tree'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 'A',
        left: { id: '2', value: 'B', left: { id: '4', value: 'D' }, right: { id: '5', value: 'E' } },
        right: { id: '3', value: 'C', right: { id: '6', value: 'F' } }
      }
    }
  },
  {
    id: 'bt-3',
    title: 'Parent-Child Relationships',
    description: 'How nodes relate to each other in a tree',
    content: {
      explanation: 'Every node except the root has exactly one parent. A node can have 0, 1, or 2 children. Siblings are nodes that share the same parent.',
      keyPoints: [
        'Parent: Node directly above another',
        'Child: Node directly below another',
        'Siblings: Nodes sharing the same parent',
        'Ancestors: All nodes on the path to root'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 8,
        left: { id: '2', value: 4, left: { id: '4', value: 2 }, right: { id: '5', value: 6 } },
        right: { id: '3', value: 12, left: { id: '6', value: 10 } }
      }
    }
  },
  {
    id: 'bt-4',
    title: 'Building Your First Tree',
    description: 'Practice inserting nodes into a binary tree',
    content: {
      explanation: 'In a general binary tree (not BST), you can insert nodes anywhere there\'s an empty slot. Let\'s build a tree by placing nodes in available positions.',
      keyPoints: [
        'Click on empty slots (marked with +) to add nodes',
        'Each node can have up to 2 children',
        'No ordering rules for general binary trees',
        'Practice the concept of parent-child connections'
      ],
      interactionType: 'build',
      initialState: { id: '1', value: 10 },
      hints: ['Click on the + buttons to add children', 'Try creating a balanced tree']
    }
  },
  {
    id: 'bt-5',
    title: 'Types of Binary Trees',
    description: 'Full, complete, and perfect binary trees',
    content: {
      explanation: 'Binary trees have special classifications based on their structure: Full (every node has 0 or 2 children), Complete (all levels filled except possibly the last), and Perfect (all internal nodes have 2 children, all leaves at same level).',
      keyPoints: [
        'Full: Every node has 0 or 2 children',
        'Complete: Filled left-to-right on each level',
        'Perfect: All leaves at same depth, all internal nodes have 2 children',
        'Degenerate: Every node has only one child (like a linked list)'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 1,
        left: { id: '2', value: 2, left: { id: '4', value: 4 }, right: { id: '5', value: 5 } },
        right: { id: '3', value: 3, left: { id: '6', value: 6 }, right: { id: '7', value: 7 } }
      }
    }
  },
  {
    id: 'bt-6',
    title: 'Tree Depth and Height',
    description: 'Measuring the size of binary trees',
    content: {
      explanation: 'Depth of a node is the number of edges from root to that node. Height of a node is the number of edges on the longest path from that node to a leaf. Tree height = height of root.',
      keyPoints: [
        'Depth: Edges from root to node',
        'Height of node: Longest path to leaf',
        'Tree height: Height of the root node',
        'Balanced trees have minimal height for their node count'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 50,
        left: { id: '2', value: 25, left: { id: '4', value: 10 }, right: { id: '5', value: 30 } },
        right: { id: '3', value: 75, left: { id: '6', value: 60, left: { id: '8', value: 55 } }, right: { id: '7', value: 90 } }
      }
    }
  },
  {
    id: 'bt-7',
    title: 'Subtrees',
    description: 'Understanding subtrees within binary trees',
    content: {
      explanation: 'A subtree is a portion of a tree that is itself a valid tree. Every node in a binary tree is the root of its own subtree, which includes all of its descendants.',
      keyPoints: [
        'Every node is root of its subtree',
        'Left subtree: All nodes under left child',
        'Right subtree: All nodes under right child',
        'Recursive structure: Trees within trees'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 'Root',
        left: { id: '2', value: 'L', left: { id: '4', value: 'LL' }, right: { id: '5', value: 'LR' } },
        right: { id: '3', value: 'R', left: { id: '6', value: 'RL' }, right: { id: '7', value: 'RR' } }
      }
    }
  },
  {
    id: 'bt-8',
    title: 'Binary Tree Recap',
    description: 'Review everything you learned',
    content: {
      explanation: 'Congratulations! You\'ve learned the fundamentals of binary trees. Let\'s review the key concepts: structure, terminology, types, and measurements.',
      keyPoints: [
        '✅ Binary trees have at most 2 children per node',
        '✅ Key terms: root, leaf, parent, child, sibling',
        '✅ Types: full, complete, perfect, degenerate',
        '✅ Measurements: depth, height, level'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 42,
        left: { id: '2', value: 21, left: { id: '4', value: 7 }, right: { id: '5', value: 35 } },
        right: { id: '3', value: 63, left: { id: '6', value: 56 }, right: { id: '7', value: 84 } }
      }
    }
  }
];

export const bstLessons: Lesson[] = [
  {
    id: 'bst-1',
    title: 'What is a BST?',
    description: 'Introduction to Binary Search Trees',
    content: {
      explanation: 'A Binary Search Tree (BST) is a binary tree with a special ordering property: for any node, all values in its left subtree are smaller, and all values in its right subtree are larger.',
      keyPoints: [
        'Left subtree values < node value',
        'Right subtree values > node value',
        'No duplicate values (typically)',
        'Enables efficient searching, insertion, and deletion'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 50,
        left: { id: '2', value: 25, left: { id: '4', value: 10 }, right: { id: '5', value: 35 } },
        right: { id: '3', value: 75, left: { id: '6', value: 60 }, right: { id: '7', value: 90 } }
      }
    }
  },
  {
    id: 'bst-2',
    title: 'The BST Property',
    description: 'Understanding the ordering rule',
    content: {
      explanation: 'The BST property must hold for EVERY node, not just the root. This means if you pick any node, its entire left subtree contains smaller values, and its entire right subtree contains larger values.',
      keyPoints: [
        'The property is recursive',
        'Every subtree is also a valid BST',
        'This enables binary search',
        'Invalid BST: violates property at any node'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 40,
        left: { id: '2', value: 20, left: { id: '4', value: 10 }, right: { id: '5', value: 30 } },
        right: { id: '3', value: 60, left: { id: '6', value: 50 }, right: { id: '7', value: 70 } }
      }
    }
  },
  {
    id: 'bst-3',
    title: 'BST Insertion',
    description: 'How to insert values correctly',
    content: {
      explanation: 'To insert a value: start at root, compare with current node. If smaller, go left; if larger, go right. Repeat until you find an empty spot - that\'s where the new node goes.',
      keyPoints: [
        'Always compare with current node',
        'Smaller → go left',
        'Larger → go right',
        'Insert at the first empty slot found'
      ],
      interactionType: 'build',
      initialState: { id: '1', value: 50 },
      hints: ['Insert values following BST rules', 'Smaller values go left, larger go right']
    }
  },
  {
    id: 'bst-4',
    title: 'Searching in a BST',
    description: 'Finding values efficiently',
    content: {
      explanation: 'Searching follows the same logic as insertion. Start at root, compare, go left or right based on comparison. This gives O(log n) average time complexity!',
      keyPoints: [
        'Compare target with current node',
        'Target < current → search left',
        'Target > current → search right',
        'Found when target = current'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 50,
        left: { id: '2', value: 25, left: { id: '4', value: 10 }, right: { id: '5', value: 35 } },
        right: { id: '3', value: 75, left: { id: '6', value: 60 }, right: { id: '7', value: 90 } }
      }
    }
  },
  {
    id: 'bst-5',
    title: 'Inorder Traversal',
    description: 'Visit nodes in sorted order',
    content: {
      explanation: 'Inorder traversal visits: Left subtree → Current node → Right subtree. In a BST, this produces values in ascending sorted order!',
      keyPoints: [
        'Order: Left → Root → Right',
        'Produces sorted output in BST',
        'Recursive algorithm',
        'Used for printing BST in order'
      ],
      interactionType: 'traverse',
      initialState: {
        id: '1', value: 40,
        left: { id: '2', value: 20, left: { id: '4', value: 10 }, right: { id: '5', value: 30 } },
        right: { id: '3', value: 60, left: { id: '6', value: 50 }, right: { id: '7', value: 70 } }
      }
    }
  },
  {
    id: 'bst-6',
    title: 'Preorder Traversal',
    description: 'Root first, then children',
    content: {
      explanation: 'Preorder traversal visits: Current node → Left subtree → Right subtree. Useful for creating a copy of the tree or prefix expressions.',
      keyPoints: [
        'Order: Root → Left → Right',
        'Process node before children',
        'Used for tree copying',
        'Useful in expression trees'
      ],
      interactionType: 'traverse',
      initialState: {
        id: '1', value: 40,
        left: { id: '2', value: 20, left: { id: '4', value: 10 }, right: { id: '5', value: 30 } },
        right: { id: '3', value: 60, left: { id: '6', value: 50 }, right: { id: '7', value: 70 } }
      }
    }
  },
  {
    id: 'bst-7',
    title: 'Postorder Traversal',
    description: 'Children first, then root',
    content: {
      explanation: 'Postorder traversal visits: Left subtree → Right subtree → Current node. Useful for deleting trees or evaluating postfix expressions.',
      keyPoints: [
        'Order: Left → Right → Root',
        'Process children before parent',
        'Used for tree deletion',
        'Useful for postfix evaluation'
      ],
      interactionType: 'traverse',
      initialState: {
        id: '1', value: 40,
        left: { id: '2', value: 20, left: { id: '4', value: 10 }, right: { id: '5', value: 30 } },
        right: { id: '3', value: 60, left: { id: '6', value: 50 }, right: { id: '7', value: 70 } }
      }
    }
  },
  {
    id: 'bst-8',
    title: 'All Traversals Compared',
    description: 'See all three traversals side by side',
    content: {
      explanation: 'Let\'s compare all three traversals on the same tree. Notice how each produces a different order, but all visit every node exactly once.',
      keyPoints: [
        'Inorder: Sorted order (Left-Root-Right)',
        'Preorder: Root first (Root-Left-Right)',
        'Postorder: Root last (Left-Right-Root)',
        'All are O(n) time complexity'
      ],
      interactionType: 'traverse',
      initialState: {
        id: '1', value: 50,
        left: { id: '2', value: 25, left: { id: '4', value: 10 }, right: { id: '5', value: 35 } },
        right: { id: '3', value: 75, left: { id: '6', value: 60 }, right: { id: '7', value: 90 } }
      }
    }
  },
  {
    id: 'bst-9',
    title: 'BST Time Complexity',
    description: 'Performance characteristics',
    content: {
      explanation: 'In a balanced BST, operations are O(log n). However, if insertions are ordered, the tree becomes skewed (like a linked list) with O(n) operations.',
      keyPoints: [
        'Balanced BST: O(log n) search/insert/delete',
        'Skewed BST: O(n) worst case',
        'Self-balancing trees fix this (AVL, Red-Black)',
        'Height determines performance'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 30,
        left: { id: '2', value: 15, left: { id: '4', value: 7 }, right: { id: '5', value: 22 } },
        right: { id: '3', value: 45, left: { id: '6', value: 38 }, right: { id: '7', value: 52 } }
      }
    }
  },
  {
    id: 'bst-10',
    title: 'BST Recap',
    description: 'Review Binary Search Trees',
    content: {
      explanation: 'You\'ve mastered BST fundamentals! You understand the ordering property, insertion, searching, and all three traversal methods.',
      keyPoints: [
        '✅ BST Property: Left < Node < Right',
        '✅ Insertion follows comparison path',
        '✅ Inorder gives sorted output',
        '✅ O(log n) operations when balanced'
      ],
      interactionType: 'observe',
      initialState: {
        id: '1', value: 42,
        left: { id: '2', value: 21, left: { id: '4', value: 7 }, right: { id: '5', value: 35 } },
        right: { id: '3', value: 63, left: { id: '6', value: 56 }, right: { id: '7', value: 84 } }
      }
    }
  }
];

export const bfsLessons: Lesson[] = [
  {
    id: 'bfs-1',
    title: 'What is BFS?',
    description: 'Introduction to Breadth-First Search',
    content: {
      explanation: 'Breadth-First Search (BFS) explores a graph level by level, visiting all neighbors of a node before moving to the next level. It uses a queue to track which node to visit next.',
      keyPoints: [
        'Explores nodes level by level',
        'Uses a QUEUE (First-In-First-Out)',
        'Finds shortest path in unweighted graphs',
        'Visits all nodes at distance k before distance k+1'
      ],
      interactionType: 'observe'
    }
  },
  {
    id: 'bfs-2',
    title: 'The Queue in BFS',
    description: 'How queues power breadth-first traversal',
    content: {
      explanation: 'The queue is essential for BFS. We enqueue (add to back) neighbors of the current node, and dequeue (remove from front) to get the next node to process. FIFO ensures level-order processing.',
      keyPoints: [
        'Enqueue: Add to back of queue',
        'Dequeue: Remove from front of queue',
        'FIFO: First In, First Out',
        'Queue maintains the "frontier" of exploration'
      ],
      interactionType: 'observe'
    }
  },
  {
    id: 'bfs-3',
    title: 'BFS Step by Step',
    description: 'Watch BFS traverse a tree',
    content: {
      explanation: 'Let\'s trace through BFS: 1) Start with root in queue. 2) Dequeue front node, mark visited. 3) Enqueue all unvisited neighbors. 4) Repeat until queue is empty.',
      keyPoints: [
        'Start: Enqueue the starting node',
        'Loop: Dequeue → Visit → Enqueue neighbors',
        'Mark nodes as visited to avoid cycles',
        'Stop when queue is empty'
      ],
      interactionType: 'traverse'
    }
  },
  {
    id: 'bfs-4',
    title: 'Level Order Traversal',
    description: 'BFS on binary trees',
    content: {
      explanation: 'When applied to a binary tree, BFS gives us level-order traversal: we visit all nodes at depth 0, then depth 1, then depth 2, and so on.',
      keyPoints: [
        'Level 0: Root only',
        'Level 1: Root\'s children',
        'Level 2: Grandchildren',
        'Each level visited left to right'
      ],
      interactionType: 'traverse'
    }
  },
  {
    id: 'bfs-5',
    title: 'Shortest Path',
    description: 'Finding the shortest path with BFS',
    content: {
      explanation: 'BFS is perfect for finding shortest paths in unweighted graphs. Since it explores level by level, the first time we reach any node, we\'ve found the shortest path to it!',
      keyPoints: [
        'First discovery = shortest path',
        'Works for unweighted graphs',
        'Track parent pointers to reconstruct path',
        'Time complexity: O(V + E)'
      ],
      interactionType: 'observe'
    }
  },
  {
    id: 'bfs-6',
    title: 'BFS on Graphs',
    description: 'Handling graphs with cycles',
    content: {
      explanation: 'Unlike trees, graphs can have cycles. We must mark nodes as "visited" when we enqueue them to prevent infinite loops and redundant processing.',
      keyPoints: [
        'Mark visited when ENQUEUING, not dequeuing',
        'Prevents processing same node twice',
        'Handles cycles correctly',
        'Works on both directed and undirected graphs'
      ],
      interactionType: 'observe'
    }
  },
  {
    id: 'bfs-7',
    title: 'BFS Recap',
    description: 'Review Breadth-First Search',
    content: {
      explanation: 'You\'ve learned BFS! Remember: use a queue, process level by level, and it finds shortest paths in unweighted graphs.',
      keyPoints: [
        '✅ Uses QUEUE (FIFO)',
        '✅ Explores level by level',
        '✅ Finds shortest paths',
        '✅ O(V + E) complexity'
      ],
      interactionType: 'observe'
    }
  }
];

export const dfsLessons: Lesson[] = [
  {
    id: 'dfs-1',
    title: 'What is DFS?',
    description: 'Introduction to Depth-First Search',
    content: {
      explanation: 'Depth-First Search (DFS) explores as far as possible along each branch before backtracking. It uses a stack (or recursion) to remember where to backtrack to.',
      keyPoints: [
        'Explores depth before breadth',
        'Uses a STACK (Last-In-First-Out)',
        'Can be implemented with recursion',
        'Goes deep, then backtracks'
      ],
      interactionType: 'observe'
    }
  },
  {
    id: 'dfs-2',
    title: 'The Stack in DFS',
    description: 'How stacks enable depth-first traversal',
    content: {
      explanation: 'DFS uses a stack (explicitly or via recursion). We push neighbors onto the stack and pop to get the next node. LIFO means we explore the most recently discovered path first.',
      keyPoints: [
        'Push: Add to top of stack',
        'Pop: Remove from top of stack',
        'LIFO: Last In, First Out',
        'Recursion uses the call stack implicitly'
      ],
      interactionType: 'observe'
    }
  },
  {
    id: 'dfs-3',
    title: 'DFS Step by Step',
    description: 'Watch DFS traverse a tree',
    content: {
      explanation: 'DFS algorithm: 1) Start with root on stack. 2) Pop top node, mark visited. 3) Push all unvisited neighbors. 4) Repeat until stack is empty.',
      keyPoints: [
        'Start: Push the starting node',
        'Loop: Pop → Visit → Push neighbors',
        'Goes deep before going wide',
        'Backtracking happens automatically'
      ],
      interactionType: 'traverse'
    }
  },
  {
    id: 'dfs-4',
    title: 'Recursive DFS',
    description: 'DFS using recursion',
    content: {
      explanation: 'DFS is naturally recursive: visit the current node, then recursively visit all unvisited neighbors. The call stack handles backtracking automatically!',
      keyPoints: [
        'Base case: Node already visited',
        'Visit current node',
        'Recursively visit each neighbor',
        'Call stack = implicit stack'
      ],
      interactionType: 'observe'
    }
  },
  {
    id: 'dfs-5',
    title: 'Backtracking',
    description: 'How DFS backtracks',
    content: {
      explanation: 'When DFS hits a dead end (no unvisited neighbors), it backtracks to the most recent node with unexplored options. The stack naturally handles this!',
      keyPoints: [
        'Dead end: No unvisited neighbors',
        'Backtrack: Pop from stack/return from recursion',
        'Continue from previous node',
        'Essential for exploring all paths'
      ],
      interactionType: 'traverse'
    }
  },
  {
    id: 'dfs-6',
    title: 'DFS Tree Traversals',
    description: 'Preorder, Inorder, Postorder as DFS',
    content: {
      explanation: 'The tree traversals we learned (preorder, inorder, postorder) are all forms of DFS! They differ only in WHEN we "visit" the node relative to its children.',
      keyPoints: [
        'Preorder: Visit → Left → Right',
        'Inorder: Left → Visit → Right',
        'Postorder: Left → Right → Visit',
        'All use depth-first exploration'
      ],
      interactionType: 'traverse'
    }
  },
  {
    id: 'dfs-7',
    title: 'DFS Applications',
    description: 'When to use DFS',
    content: {
      explanation: 'DFS is useful for: detecting cycles, topological sorting, finding connected components, solving mazes, and checking path existence.',
      keyPoints: [
        'Cycle detection in graphs',
        'Topological sorting (DAGs)',
        'Finding all paths',
        'Maze solving algorithms'
      ],
      interactionType: 'observe'
    }
  },
  {
    id: 'dfs-8',
    title: 'DFS Recap',
    description: 'Review Depth-First Search',
    content: {
      explanation: 'You\'ve mastered DFS! Remember: use a stack (or recursion), go deep first, and backtrack when needed.',
      keyPoints: [
        '✅ Uses STACK (LIFO) or recursion',
        '✅ Explores depth before breadth',
        '✅ Backtracking is automatic',
        '✅ O(V + E) complexity'
      ],
      interactionType: 'observe'
    }
  }
];