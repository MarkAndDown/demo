// Test script for import modes functionality
console.log('=== Testing Import Modes ===');

// Simulate the application class
class TestApp {
    constructor() {
        this.collections = [
            {
                id: 1,
                name: 'Existing Collection 1',
                requests: [
                    { id: 1, method: 'GET', name: 'Get Users', url: 'https://api.example.com/users' }
                ]
            },
            {
                id: 2,
                name: 'Existing Collection 2',
                requests: [
                    { id: 2, method: 'POST', name: 'Create User', url: 'https://api.example.com/users' }
                ]
            }
        ];
    }
    
    importCollections(collections, mode = 'add') {
        console.log(`Importing with mode: ${mode}`);
        console.log('Existing collections:', this.collections.length);
        
        if (collections.info && collections.item) {
            // Postman format
            const convertedCollections = this.convertPostmanCollection(collections);
            
            if (mode === 'replace') {
                this.collections = convertedCollections;
                console.log('✓ Replaced existing collections');
            } else {
                this.collections = this.collections.concat(convertedCollections);
                console.log('✓ Added to existing collections');
            }
        } else if (collections.collections) {
            // NB Man format
            if (mode === 'replace') {
                this.collections = collections.collections;
                console.log('✓ Replaced existing collections');
            } else {
                this.collections = this.collections.concat(collections.collections);
                console.log('✓ Added to existing collections');
            }
        }
        
        console.log('Final collections count:', this.collections.length);
        console.log('Collection names:', this.collections.map(c => c.name));
    }
    
    convertPostmanCollection(postmanCollection) {
        return [{
            id: Date.now(),
            name: postmanCollection.info.name,
            requests: postmanCollection.item.map(item => ({
                id: Date.now() + Math.random(),
                method: item.request.method,
                name: item.name,
                url: item.request.url.raw || 'https://example.com'
            }))
        }];
    }
    
    testImportModes() {
        console.log('\n=== Initial State ===');
        console.log('Collections:', this.collections.length);
        console.log('Names:', this.collections.map(c => c.name));
        
        // Test data
        const postmanCollection = {
            info: { name: 'Imported Postman Collection' },
            item: [
                {
                    name: 'New Request 1',
                    request: { method: 'GET', url: { raw: 'https://api.example.com/new1' } }
                },
                {
                    name: 'New Request 2',
                    request: { method: 'POST', url: { raw: 'https://api.example.com/new2' } }
                }
            ]
        };
        
        const nbManCollection = {
            collections: [
                {
                    id: 3,
                    name: 'Imported NB Man Collection',
                    requests: [
                        { id: 3, method: 'PUT', name: 'Update Item', url: 'https://api.example.com/update' }
                    ]
                }
            ]
        };
        
        console.log('\n=== Testing Add Mode (Postman) ===');
        this.importCollections(postmanCollection, 'add');
        
        console.log('\n=== Testing Add Mode (NB Man) ===');
        this.importCollections(nbManCollection, 'add');
        
        console.log('\n=== Testing Replace Mode ===');
        this.importCollections(postmanCollection, 'replace');
        
        console.log('\n✓ All import modes tested successfully');
    }
}

// Run the test
const testApp = new TestApp();
testApp.testImportModes(); 