// Curated interview question bank organized by category
const questions = {
    behavioral: [
        {
            id: 'b1',
            category: 'behavioral',
            question: 'Tell me about a time you had to overcome a significant challenge at work.',
            difficulty: 'Medium',
            tip: 'Use the STAR method: Situation, Task, Action, Result.',
        },
        {
            id: 'b2',
            category: 'behavioral',
            question: 'Describe a situation where you had a conflict with a teammate. How did you resolve it?',
            difficulty: 'Medium',
            tip: 'Focus on resolution and what you learned, not blame.',
        },
        {
            id: 'b3',
            category: 'behavioral',
            question: 'Give an example of when you took initiative without being asked.',
            difficulty: 'Easy',
            tip: 'Show concrete impact — metrics or outcomes help.',
        },
        {
            id: 'b4',
            category: 'behavioral',
            question: 'Tell me about a time you failed and what you learned from it.',
            difficulty: 'Hard',
            tip: 'Be honest, show accountability, and emphasize growth.',
        },
        {
            id: 'b5',
            category: 'behavioral',
            question: 'Describe a time you had to make a decision with incomplete information.',
            difficulty: 'Hard',
            tip: 'Highlight your risk-assessment and decision-making process.',
        },
        {
            id: 'b6',
            category: 'behavioral',
            question: 'How have you managed working under a tight deadline?',
            difficulty: 'Easy',
            tip: 'Mention prioritization, communication, and outcome.',
        },
    ],
    technical: [
        {
            id: 't1',
            category: 'technical',
            question: 'Explain the difference between SQL and NoSQL databases. When would you use each?',
            difficulty: 'Medium',
            tip: 'Give real-world use cases — e.g., transactional vs. document-heavy workloads.',
        },
        {
            id: 't2',
            category: 'technical',
            question: 'Walk me through how you would optimize a slow database query.',
            difficulty: 'Hard',
            tip: 'Mention indexing, query plans, caching, and profiling tools.',
        },
        {
            id: 't3',
            category: 'technical',
            question: 'What is the difference between REST and GraphQL? When would you choose one over the other?',
            difficulty: 'Medium',
            tip: 'Consider over-fetching, under-fetching, and client flexibility.',
        },
        {
            id: 't4',
            category: 'technical',
            question: 'How does garbage collection work in your primary programming language?',
            difficulty: 'Hard',
            tip: 'Reference specific GC algorithms like G1, mark-and-sweep, or reference counting.',
        },
        {
            id: 't5',
            category: 'technical',
            question: 'What are the SOLID principles? Can you give examples of each?',
            difficulty: 'Medium',
            tip: 'Concrete code-level examples show you\'ve applied them, not just memorized them.',
        },
        {
            id: 't6',
            category: 'technical',
            question: 'Explain how you would implement caching in a high-traffic API.',
            difficulty: 'Hard',
            tip: 'Cover cache-aside vs. write-through, TTL, eviction policies, Redis.',
        },
    ],
    systemdesign: [
        {
            id: 's1',
            category: 'systemdesign',
            question: 'Design a URL shortener like bit.ly. Walk me through your approach.',
            difficulty: 'Hard',
            tip: 'Cover hashing strategies, database schema, and scaling for reads.',
        },
        {
            id: 's2',
            category: 'systemdesign',
            question: 'How would you design a real-time chat application?',
            difficulty: 'Hard',
            tip: 'Discuss WebSockets, message queues, storage, and presence.',
        },
        {
            id: 's3',
            category: 'systemdesign',
            question: 'Design a notification system that handles millions of users.',
            difficulty: 'Hard',
            tip: 'Think about fan-out strategies, different channels (push, email, SMS).',
        },
        {
            id: 's4',
            category: 'systemdesign',
            question: 'How would you approach designing an API rate limiter?',
            difficulty: 'Medium',
            tip: 'Token bucket, sliding window, fixed window — pros and cons.',
        },
        {
            id: 's5',
            category: 'systemdesign',
            question: 'Design a distributed key-value store.',
            difficulty: 'Hard',
            tip: 'Cover CAP theorem, replication, consistent hashing, and failure handling.',
        },
        {
            id: 's6',
            category: 'systemdesign',
            question: 'How would you design a search autocomplete system?',
            difficulty: 'Medium',
            tip: 'Think about trie structures, caching popular queries, and latency SLAs.',
        },
    ],
    leadership: [
        {
            id: 'l1',
            category: 'leadership',
            question: 'Tell me about a time you led a team through an ambiguous or uncertain situation.',
            difficulty: 'Hard',
            tip: 'Show how you created clarity, inspired trust, and drove execution.',
        },
        {
            id: 'l2',
            category: 'leadership',
            question: 'How do you prioritize work when everything feels equally urgent?',
            difficulty: 'Medium',
            tip: 'Mention frameworks (Eisenhower matrix, RICE) and stakeholder alignment.',
        },
        {
            id: 'l3',
            category: 'leadership',
            question: 'Describe a time you had to influence stakeholders without direct authority.',
            difficulty: 'Hard',
            tip: 'Emphasize empathy, data-driven communication, and relationship building.',
        },
        {
            id: 'l4',
            category: 'leadership',
            question: 'How have you handled giving critical feedback to a colleague?',
            difficulty: 'Medium',
            tip: 'Structure, empathy, and focusing on behaviors over personality matter here.',
        },
        {
            id: 'l5',
            category: 'leadership',
            question: 'Tell me about a strategic decision you made that had long-term impact.',
            difficulty: 'Hard',
            tip: 'Demonstrate vision, trade-off analysis, and measurable outcomes.',
        },
        {
            id: 'l6',
            category: 'leadership',
            question: 'How do you build and maintain a high-performing team culture?',
            difficulty: 'Medium',
            tip: 'Talk about psychological safety, feedback cycles, and celebrating wins.',
        },
    ],
}

export const categories = [
    { id: 'behavioral', label: 'Behavioral', icon: '🧠', color: '#7c3aed' },
    { id: 'technical', label: 'Technical', icon: '⚙️', color: '#06b6d4' },
    { id: 'systemdesign', label: 'System Design', icon: '🏗️', color: '#10b981' },
    { id: 'leadership', label: 'Leadership', icon: '🎯', color: '#f59e0b' },
]

export const difficultyColors = {
    Easy: { bg: 'var(--clr-success-dim)', text: 'var(--clr-success)' },
    Medium: { bg: 'var(--clr-warning-dim)', text: 'var(--clr-warning)' },
    Hard: { bg: 'var(--clr-danger-dim)', text: 'var(--clr-danger)' },
}

export default questions
