const test = async () => {
    try {
        console.log('Registering user...');
        await fetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test5@test.com', full_name: 'Test', password: 'password123', organization_name: 'Org' })
        });

        console.log('Logging in...');
        const formData = new URLSearchParams();
        formData.append('username', 'test5@test.com');
        formData.append('password', 'password123');
        const loginRes = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const loginData = await loginRes.json();
        const token = loginData.access_token;
        console.log('Token acquired:', !!token);

        console.log('Submitting analysis...');
        const analysisRes = await fetch('http://localhost:8000/api/analysis/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Node Test',
                invention_description: 'This is a test document with at least 50 characters to pass the validation step in the backend API.'
            })
        });
        console.log('Analysis Status:', analysisRes.status);
        console.log('Analysis Data:', await analysisRes.json());

        // Wait 3 seconds
        await new Promise(r => setTimeout(r, 3000));

        console.log('Fetching analysis list...');
        const listRes = await fetch('http://localhost:8000/api/analysis/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        console.log('List Length:', listData.length);
        if (listData.length > 0) {
            console.log('Latest Analysis Status:', listData[0].status);
        }
    } catch (e) {
        console.error(e);
    }
};
test();
