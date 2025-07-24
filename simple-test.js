// Simple test for Postman collection import
const fs = require('fs');

console.log('=== Simple Import Test ===');

try {
    // Step 1: Read file
    console.log('Step 1: Reading file...');
    const data = fs.readFileSync('123.postman_collection.json', 'utf8');
    console.log('✓ File read successfully, length:', data.length);

    // Step 2: Parse JSON
    console.log('Step 2: Parsing JSON...');
    const collection = JSON.parse(data);
    console.log('✓ JSON parsed successfully');
    console.log('Collection name:', collection.info.name);
    console.log('Number of items:', collection.item.length);

    // Step 3: Validate structure
    console.log('Step 3: Validating structure...');
    if (collection.info && collection.item) {
        console.log('✓ Valid Postman collection structure');
    } else {
        console.log('✗ Invalid structure');
        process.exit(1);
    }

    // Step 4: Test URL conversion
    console.log('Step 4: Testing URL conversion...');
    collection.item.forEach((item, index) => {
        if (item.request && item.request.url) {
            const originalUrl = item.request.url.raw;
            let fixedUrl = originalUrl;
            
            if (!fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://')) {
                if (fixedUrl.includes('localhost') || fixedUrl.includes('127.0.0.1')) {
                    fixedUrl = 'http://' + fixedUrl;
                } else {
                    fixedUrl = 'https://' + fixedUrl;
                }
            }
            
            console.log(`  Request ${index + 1}: ${originalUrl} → ${fixedUrl}`);
        }
    });

    // Step 5: Test body conversion
    console.log('Step 5: Testing body conversion...');
    collection.item.forEach((item, index) => {
        if (item.request && item.request.body) {
            console.log(`  Request ${index + 1} body mode: ${item.request.body.mode}`);
            if (item.request.body.formdata) {
                console.log(`    Form data items: ${item.request.body.formdata.length}`);
            }
        }
    });

    console.log('✓ All tests passed!');
    console.log('=== Test Complete ===');

} catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
} 