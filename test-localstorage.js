// Test script for localStorage functionality
console.log('=== Testing localStorage Functionality ===');

// Test data
const testData = {
    collections: [
        {
            id: 1,
            name: 'Test Collection 1',
            requests: [
                {
                    id: 1,
                    name: 'Get Users',
                    method: 'GET',
                    url: 'https://api.example.com/users',
                    params: [],
                    headers: [],
                    body: { type: 'none', content: '' },
                    auth: { type: 'none' },
                    tests: ''
                }
            ]
        },
        {
            id: 2,
            name: 'Test Collection 2',
            requests: [
                {
                    id: 2,
                    name: 'Create User',
                    method: 'POST',
                    url: 'https://api.example.com/users',
                    params: [],
                    headers: [],
                    body: { type: 'json', content: '{"name": "test"}' },
                    auth: { type: 'none' },
                    tests: ''
                }
            ]
        }
    ],
    history: [
        {
            id: Date.now(),
            method: 'GET',
            url: 'https://api.example.com/users',
            timestamp: new Date().toISOString()
        },
        {
            id: Date.now() + 1,
            method: 'POST',
            url: 'https://api.example.com/users',
            timestamp: new Date().toISOString()
        }
    ],
    environments: {
        default: {},
        development: {
            baseUrl: 'http://localhost:3000',
            apiKey: 'dev-key-123'
        }
    }
};

// Test localStorage functions
function testLocalStorage() {
    console.log('\n=== Testing Save Function ===');
    
    try {
        // Save test data
        const jsonData = JSON.stringify(testData);
        localStorage.setItem('nbMan', jsonData);
        
        console.log('✓ Data saved successfully');
        console.log('Data size:', jsonData.length, 'bytes');
        console.log('Collections:', testData.collections.length);
        console.log('History:', testData.history.length);
        console.log('Environments:', Object.keys(testData.environments).length);
        
        // Verify data was saved
        const savedData = localStorage.getItem('nbMan');
        if (savedData) {
            console.log('✓ Data found in localStorage');
            console.log('Saved data size:', savedData.length, 'bytes');
        } else {
            console.log('✗ Data not found in localStorage');
            return false;
        }
        
        console.log('\n=== Testing Load Function ===');
        
        // Load and parse data
        const parsedData = JSON.parse(savedData);
        
        console.log('✓ Data parsed successfully');
        console.log('Loaded collections:', parsedData.collections.length);
        console.log('Loaded history:', parsedData.history.length);
        console.log('Loaded environments:', Object.keys(parsedData.environments).length);
        
        // Verify data integrity
        if (parsedData.collections.length === testData.collections.length &&
            parsedData.history.length === testData.history.length &&
            Object.keys(parsedData.environments).length === Object.keys(testData.environments).length) {
            console.log('✓ Data integrity verified');
        } else {
            console.log('✗ Data integrity check failed');
            return false;
        }
        
        console.log('\n=== Testing Clear Function ===');
        
        // Clear data
        localStorage.removeItem('nbMan');
        const clearedData = localStorage.getItem('nbMan');
        
        if (!clearedData) {
            console.log('✓ Data cleared successfully');
        } else {
            console.log('✗ Data not cleared');
            return false;
        }
        
        console.log('\n✓ All localStorage tests passed!');
        return true;
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
}

// Run the test
const testResult = testLocalStorage();

if (testResult) {
    console.log('\n=== localStorage is working correctly ===');
} else {
    console.log('\n=== localStorage has issues ===');
} 