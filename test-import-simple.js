// Simple test for import functionality without Electron
const fs = require('fs');

console.log('=== Testing Import Functionality ===');

// Simulate the importCollections method
function importCollections(collections) {
    console.log('✓ importCollections called with:', collections);
    
    if (collections.info && collections.item) {
        console.log('✓ Detected Postman collection:', collections.info.name);
        console.log('✓ Number of items:', collections.item.length);
        
        // Test conversion
        const convertedCollection = convertPostmanCollection(collections);
        console.log('✓ Conversion successful');
        console.log('✓ Converted collection name:', convertedCollection.name);
        console.log('✓ Converted requests count:', convertedCollection.requests.length);
        
        return convertedCollection;
    } else {
        console.log('✓ Detected NB Man collection');
        return collections;
    }
}

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
    
    console.log(`  Converting request: ${request.name}`);
    console.log(`    Method: ${request.method}`);
    console.log(`    URL: ${request.url}`);
    
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
    
    // Simplified URL building
    let url = '';
    if (urlObj.protocol) {
        url += urlObj.protocol + '://';
    } else {
        url += 'https://';
    }
    
    if (urlObj.host) {
        if (Array.isArray(urlObj.host)) {
            url += urlObj.host.join('.');
        } else {
            url += urlObj.host;
        }
    }
    
    if (urlObj.port) {
        url += ':' + urlObj.port;
    }
    
    if (urlObj.path) {
        if (Array.isArray(urlObj.path)) {
            url += '/' + urlObj.path.join('/');
        } else {
            url += '/' + urlObj.path;
        }
    }
    
    return url;
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

// Test the import
try {
    const data = fs.readFileSync('123.postman_collection.json', 'utf8');
    const collections = JSON.parse(data);
    
    console.log('✓ File read and parsed successfully');
    const result = importCollections(collections);
    
    console.log('\n=== Test Results ===');
    console.log('✓ Import test completed successfully');
    console.log('✓ Collection imported:', result.name);
    console.log('✓ Requests converted:', result.requests.length);
    
} catch (error) {
    console.error('✗ Test failed:', error.message);
} 