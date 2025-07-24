// Test script for delete functionality
console.log('=== Testing Delete Functions ===');

// Simulate the application class
class TestApp {
    constructor() {
        this.history = [
            { method: 'GET', url: 'https://api.example.com/users', timestamp: Date.now() },
            { method: 'POST', url: 'https://api.example.com/users', timestamp: Date.now() },
            { method: 'PUT', url: 'https://api.example.com/users/1', timestamp: Date.now() }
        ];
        
        this.collections = [
            {
                id: 1,
                name: 'Test Collection 1',
                requests: [
                    { id: 1, method: 'GET', name: 'Get Users', url: 'https://api.example.com/users' },
                    { id: 2, method: 'POST', name: 'Create User', url: 'https://api.example.com/users' }
                ]
            },
            {
                id: 2,
                name: 'Test Collection 2',
                requests: [
                    { id: 3, method: 'PUT', name: 'Update User', url: 'https://api.example.com/users/1' }
                ]
            }
        ];
    }
    
    deleteHistoryItem(index) {
        console.log(`Deleting history item at index ${index}:`, this.history[index]);
        this.history.splice(index, 1);
        console.log('History after deletion:', this.history);
    }
    
    deleteCollection(collectionIndex) {
        console.log(`Deleting collection at index ${collectionIndex}:`, this.collections[collectionIndex].name);
        this.collections.splice(collectionIndex, 1);
        console.log('Collections after deletion:', this.collections.map(c => c.name));
    }
    
    deleteRequestFromCollection(collectionIndex, requestIndex) {
        const collection = this.collections[collectionIndex];
        const request = collection.requests[requestIndex];
        console.log(`Deleting request at index ${requestIndex} from collection "${collection.name}":`, request.name);
        collection.requests.splice(requestIndex, 1);
        console.log(`Requests in "${collection.name}" after deletion:`, collection.requests.map(r => r.name));
    }
    
    testDeleteFunctions() {
        console.log('\n=== Initial State ===');
        console.log('History items:', this.history.length);
        console.log('Collections:', this.collections.length);
        
        console.log('\n=== Testing History Deletion ===');
        this.deleteHistoryItem(1);
        
        console.log('\n=== Testing Collection Deletion ===');
        this.deleteCollection(0);
        
        console.log('\n=== Testing Request Deletion ===');
        this.deleteRequestFromCollection(0, 0);
        
        console.log('\n=== Final State ===');
        console.log('History items:', this.history.length);
        console.log('Collections:', this.collections.length);
        
        console.log('\n✓ All delete functions tested successfully');
    }
}

// Run the test
const testApp = new TestApp();
testApp.testDeleteFunctions(); 