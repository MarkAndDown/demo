// Test script for Postman collection import
const fs = require('fs');

try {
    // Read the Postman collection file
    const collectionData = fs.readFileSync('123.postman_collection.json', 'utf8');
    const collection = JSON.parse(collectionData);

    console.log('=== Postman Collection Import Test ===');
    console.log('Collection name:', collection.info.name);
    console.log('Number of items:', collection.item.length);

    // Test URL building function
    function buildUrlFromPostman(urlObj) {
        if (typeof urlObj === 'string') {
            return urlObj;
        }
        
        if (urlObj.raw) {
            // Fix URL format if missing protocol
            let rawUrl = urlObj.raw;
            if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
                // Check if it's a localhost URL
                if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
                    rawUrl = 'http://' + rawUrl;
                } else {
                    // Default to https for external URLs
                    rawUrl = 'https://' + rawUrl;
                }
            }
            return rawUrl;
        }
        
        let url = '';
        
        // Determine protocol
        if (urlObj.protocol) {
            url += urlObj.protocol + '://';
        } else {
            // Default protocol based on host
            if (urlObj.host && (Array.isArray(urlObj.host) ? 
                urlObj.host.some(h => h.includes('localhost') || h.includes('127.0.0.1')) : 
                (urlObj.host.includes('localhost') || urlObj.host.includes('127.0.0.1')))) {
                url += 'http://';
            } else {
                url += 'https://';
            }
        }
        
        // Add host
        if (urlObj.host) {
            if (Array.isArray(urlObj.host)) {
                url += urlObj.host.join('.');
            } else {
                url += urlObj.host;
            }
        }
        
        // Add port
        if (urlObj.port) {
            url += ':' + urlObj.port;
        }
        
        // Add path
        if (urlObj.path) {
            if (Array.isArray(urlObj.path)) {
                url += '/' + urlObj.path.join('/');
            } else {
                url += '/' + urlObj.path;
            }
        }
        
        return url;
    }

    // Test each request
    collection.item.forEach((item, index) => {
        console.log(`\n--- Request ${index + 1} ---`);
        console.log('Name:', item.name);
        console.log('Method:', item.request.method);
        console.log('Original URL:', item.request.url.raw);
        console.log('Fixed URL:', buildUrlFromPostman(item.request.url));
        
        if (item.request.body) {
            console.log('Body mode:', item.request.body.mode);
            if (item.request.body.formdata) {
                console.log('Form data items:', item.request.body.formdata.length);
                item.request.body.formdata.forEach((formItem, formIndex) => {
                    console.log(`  Form item ${formIndex}: ${formItem.key} = ${formItem.value} (${formItem.type})`);
                });
            }
        }
    });

    console.log('\n=== Test Complete ===');
} catch (error) {
    console.error('Test failed:', error);
} 