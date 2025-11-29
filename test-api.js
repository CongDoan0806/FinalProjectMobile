// Test script for API
const testAPI = async () => {
  try {
    console.log('Testing API...');
    
    const response = await fetch('http://localhost:8080/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Bạn có biết lập trình không'
      }),
    });

    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testAPI();