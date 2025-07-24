// Test script for collection display functionality
const fs = require('fs');

console.log('=== Testing Collection Display ===');

// Simulate the convertPostmanCollection method
function convertPostmanCollection(postmanCollection) {
    console.log('Converting Postman collection...');
    
    const collection = {
        id: Date.now(),
        name: postmanCollection.info.name,
        requests: []
    };
    
    processPostmanItems(postmanCollection.item, collection.requests);
    
    return collection;
}

// Simulate the processPostmanItems method
function processPostmanItems(items, requestsArray) {
    items.forEach(item => {
        if (item.request) {
            const request = convertPostmanRequest(item);
            requestsArray.push(request);
        } else if (item.item) {
            processPostmanItems(item.item, requestsArray);
        }
    });
}

// Simulate the convertPostmanRequest method
function convertPostmanRequest(postmanItem) {
    const request = {
        id: Date.now() + Math.random(),
        name: postmanItem.name,
        method: postmanItem.request.method,
        url: buildUrlFromPostman(postmanItem.request.url),
        params: convertPostmanQueryParams(postmanItem.request.url),
        headers: convertPostmanHeaders(postmanItem.request.header),
        body: convertPostmanBody(postmanItem.request.body),
        auth: convertPostmanAuth(postmanItem.request.auth)
    };
    
    return request;
}

// Simulate the buildUrlFromPostman method
function buildUrlFromPostman(urlObj) {
    if (typeof urlObj === 'string') {
        return urlObj;
    }
    
    if (urlObj.raw) {
        let rawUrl = urlObj.raw;
        if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
            if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
                rawUrl = 'http://' + rawUrl;
            } else {
                rawUrl = 'https://' + rawUrl;
            }
        }
        return rawUrl;
    }
    
    return 'https://example.com';
}

// Simplified conversion methods
function convertPostmanQueryParams(urlObj) {
    return [];
}

function convertPostmanHeaders(headers) {
    return [];
}

function convertPostmanBody(body) {
    return { type: 'none', content: '' };
}

function convertPostmanAuth(auth) {
    return { type: 'none' };
}

// Test the collection display
try {
    const data = fs.readFileSync('123.postman_collection.json', 'utf8');
    const collections = JSON.parse(data);
    
    console.log('✓ File read and parsed successfully');
    
    // Convert Postman collection
    const convertedCollection = convertPostmanCollection(collections);
    
    console.log('\n=== Collection Display Test ===');
    console.log('Collection name:', convertedCollection.name);
    console.log('Number of requests:', convertedCollection.requests.length);
    
    console.log('\n=== Request Details ===');
    convertedCollection.requests.forEach((request, index) => {
        console.log(`${index + 1}. ${request.method} ${request.name}`);
        console.log(`   URL: ${request.url}`);
        console.log(`   ID: ${request.id}`);
        console.log('');
    });
    
    console.log('✓ Collection display test completed successfully');
    
} catch (error) {
    console.error('✗ Test failed:', error.message);
} 