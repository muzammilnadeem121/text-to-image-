async function generateImage() {
    const text = document.getElementById('text-input').value;
    const apiKey = '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';  // Replace with your Hugging Face API key

    if (!text) {
        alert('Please enter some text.');
        return;
      }

      const maxRetries = 10;
      let attempt = 0;
      const retryInterval = 10000; // 10 seconds

      async function fetchImage() {
        try {
          const response = await axios.post('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
            inputs: text
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            responseType: 'blob'  // Handle response as a binary large object
          });

          if (response.status === 503 && response.data.error === 'Model runwayml/stable-diffusion-v1-5 is currently loading') {
            if (attempt < maxRetries) {
              attempt++;
              console.log(`Model is loading. Retrying in ${retryInterval / 1000} seconds... (Attempt ${attempt}/${maxRetries})`);
              setTimeout(fetchImage, retryInterval);
            } else {
              alert('Model is still loading. Please try again later.');
            }
          } else if (response.data.error) {
            alert('Error: ' + response.data.error);
          } else {
            console.log('API Response:', response.data);

            const reader = new FileReader();
            reader.onloadend = function() {
              const imgElement = document.createElement('img');
              imgElement.src = reader.result;
              imgElement.classList.add('img-fluid');
              imgElement.style.width = '100%';

              document.getElementById('image-container').innerHTML = '';
              document.getElementById('image-container').appendChild(imgElement);
            };
            reader.readAsDataURL(response.data);  // Convert blob to data URL
          }
        } catch (error) {
          console.error('Error generating image:', error);
          if (error.response) {
            console.error('Response data:', error.response.data);
            alert('Error: ' + error.response.data.error);
          } else {
            alert('Error generating image. Please check the console for details.');
          }
        }
      }

      fetchImage();
    }