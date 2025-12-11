export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

export const topicQuestions: Record<string, QuizQuestion[]> = {
  'binary-trees': [
    { id: 1, question: "What is the maximum number of children a node can have in a binary tree?", options: ["1", "2", "3", "Unlimited"], correct: 1 },
    { id: 2, question: "What is the topmost node in a tree called?", options: ["Leaf", "Parent", "Root", "Branch"], correct: 2 },
    { id: 3, question: "A node with no children is called a:", options: ["Root", "Leaf", "Parent", "Sibling"], correct: 1 },
    { id: 4, question: "The depth of the root node is:", options: ["1", "0", "-1", "Undefined"], correct: 1 },
    { id: 5, question: "In a full binary tree, every node has:", options: ["1 child", "0 or 2 children", "2 children always", "Any number of children"], correct: 1 },
    { id: 6, question: "A complete binary tree fills levels from:", options: ["Right to left", "Left to right", "Random order", "Bottom to top"], correct: 1 },
    { id: 7, question: "Height of a tree with only root is:", options: ["0", "1", "-1", "2"], correct: 0 },
    { id: 8, question: "Nodes at the same level with same parent are:", options: ["Cousins", "Siblings", "Twins", "Partners"], correct: 1 },
    { id: 9, question: "A degenerate binary tree resembles a:", options: ["Array", "Linked List", "Stack", "Queue"], correct: 1 },
    { id: 10, question: "The maximum nodes at level L is:", options: ["L", "2L", "2^L", "L^2"], correct: 2 },
  ],
  'bst': [
    { id: 1, question: "In a BST, left child is always:", options: ["Greater than parent", "Less than parent", "Equal to parent", "Random"], correct: 1 },
    { id: 2, question: "BST search average time complexity is:", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1 },
    { id: 3, question: "Inorder traversal of BST gives:", options: ["Random order", "Sorted ascending", "Sorted descending", "Level order"], correct: 1 },
    { id: 4, question: "BST worst case occurs when tree is:", options: ["Balanced", "Skewed/Linear", "Complete", "Perfect"], correct: 1 },
    { id: 5, question: "To insert 25 in BST with root 30, go:", options: ["Right", "Left", "Either", "Cannot insert"], correct: 1 },
    { id: 6, question: "BST property must hold for:", options: ["Root only", "Every node", "Leaf nodes", "Internal nodes"], correct: 1 },
    { id: 7, question: "Preorder traversal visits:", options: ["Left-Root-Right", "Root-Left-Right", "Left-Right-Root", "Right-Left-Root"], correct: 1 },
    { id: 8, question: "Postorder traversal visits:", options: ["Left-Root-Right", "Root-Left-Right", "Left-Right-Root", "Right-Root-Left"], correct: 2 },
    { id: 9, question: "Finding minimum in BST requires going:", options: ["Always right", "Always left", "Both directions", "To root"], correct: 1 },
    { id: 10, question: "BST allows duplicate values:", options: ["Always", "Never (typically)", "Only in leaves", "Only at root"], correct: 1 },
  ],
  'bfs': [
    { id: 1, question: "BFS uses which data structure?", options: ["Stack", "Queue", "Array", "Tree"], correct: 1 },
    { id: 2, question: "BFS explores nodes:", options: ["Depth first", "Level by level", "Random", "Reverse order"], correct: 1 },
    { id: 3, question: "BFS is ideal for finding:", options: ["Longest path", "Shortest path (unweighted)", "Any path", "No paths"], correct: 1 },
    { id: 4, question: "In BFS, nodes are processed in:", options: ["LIFO order", "FIFO order", "Random order", "Sorted order"], correct: 1 },
    { id: 5, question: "BFS time complexity is:", options: ["O(V)", "O(E)", "O(V + E)", "O(V × E)"], correct: 2 },
    { id: 6, question: "BFS on a tree is called:", options: ["Inorder", "Level order", "Postorder", "Preorder"], correct: 1 },
    { id: 7, question: "To avoid revisiting nodes, BFS uses:", options: ["Stack", "Visited set/array", "Priority queue", "Nothing"], correct: 1 },
    { id: 8, question: "BFS explores all nodes at distance k before:", options: ["Distance k-1", "Distance k+1", "Distance 0", "Random"], correct: 1 },
    { id: 9, question: "Space complexity of BFS is:", options: ["O(1)", "O(log V)", "O(V)", "O(V²)"], correct: 2 },
    { id: 10, question: "BFS can detect cycles in:", options: ["Only trees", "Only directed graphs", "Both directed and undirected", "Neither"], correct: 2 },
  ],
  'dfs': [
    { id: 1, question: "DFS uses which data structure?", options: ["Queue", "Stack", "Heap", "Array"], correct: 1 },
    { id: 2, question: "DFS explores as far as possible along:", options: ["Each level", "Each branch", "Random paths", "Shortest path"], correct: 1 },
    { id: 3, question: "DFS can be implemented using:", options: ["Only iteration", "Only recursion", "Both", "Neither"], correct: 2 },
    { id: 4, question: "DFS time complexity is:", options: ["O(V)", "O(E)", "O(V + E)", "O(V × E)"], correct: 2 },
    { id: 5, question: "Which traversal is a type of DFS?", options: ["Level order", "BFS", "Inorder", "None"], correct: 2 },
    { id: 6, question: "DFS is useful for:", options: ["Shortest path", "Topological sorting", "Level order", "Finding minimum"], correct: 1 },
    { id: 7, question: "In recursive DFS, the call stack acts as:", options: ["Queue", "Implicit stack", "Heap", "Nothing"], correct: 1 },
    { id: 8, question: "DFS backtracks when:", options: ["Queue empty", "Node has no unvisited neighbors", "Level complete", "Never"], correct: 1 },
    { id: 9, question: "DFS can detect:", options: ["Only BFS paths", "Cycles in graphs", "Shortest paths", "Minimum spanning tree"], correct: 1 },
    { id: 10, question: "Space complexity of DFS is:", options: ["O(1)", "O(height/depth)", "O(V²)", "O(E)"], correct: 1 },
  ],
  'graphs': [
    { id: 1, question: "A graph consists of:", options: ["Only vertices", "Only edges", "Vertices and edges", "Nodes only"], correct: 2 },
    { id: 2, question: "In an undirected graph, edges are:", options: ["One-way", "Two-way", "No direction", "Both B and C"], correct: 3 },
    { id: 3, question: "A connected graph has:", options: ["No edges", "Path between every pair of vertices", "Cycles only", "No cycles"], correct: 1 },
    { id: 4, question: "A graph with no cycles is called:", options: ["Cyclic", "Acyclic", "Complete", "Dense"], correct: 1 },
    { id: 5, question: "In a weighted graph, edges have:", options: ["Colors", "Values/costs", "No properties", "Names"], correct: 1 },
    { id: 6, question: "Degree of a vertex is:", options: ["Its value", "Number of edges connected to it", "Its depth", "Its height"], correct: 1 },
    { id: 7, question: "A complete graph has edge between:", options: ["No vertices", "Every pair of vertices", "Adjacent vertices only", "Random vertices"], correct: 1 },
    { id: 8, question: "Adjacency matrix space complexity:", options: ["O(V)", "O(E)", "O(V²)", "O(V + E)"], correct: 2 },
    { id: 9, question: "Adjacency list is better for:", options: ["Dense graphs", "Sparse graphs", "Complete graphs", "All graphs"], correct: 1 },
    { id: 10, question: "A self-loop is an edge from:", options: ["Vertex to itself", "Two different vertices", "No vertices", "All vertices"], correct: 0 },
  ],
};

export const getQuestionsForTopic = (topicId: string): QuizQuestion[] => {
  return topicQuestions[topicId] || topicQuestions['binary-trees'];
};
