const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');

// Drag and drop events
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Click to browse
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

async function handleFiles(files) {
    if (files.length === 0) return;
    
    progressSection.style.display = 'block';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressText.textContent = `Uploading ${file.name} (${i + 1}/${files.length})...`;
        
        try {
            const result = await uploadFile(file);
            displayResult(result, file);
        } catch (error) {
            displayError(file.name, error.message);
        }
        
        // Update progress
        const progress = ((i + 1) / files.length) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    progressText.textContent = 'Upload completed!';
    setTimeout(() => {
        progressSection.style.display = 'none';
        progressFill.style.width = '0%';
    }, 2000);
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }
    
    return await response.json();
}

function displayResult(result, file) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'file-result';
    
    const fileType = file.type.split('/')[0];
    let previewHTML = '';
    
    if (fileType === 'image') {
        previewHTML = `<div class="file-preview"><img src="${result.url}" alt="Preview"></div>`;
    } else if (fileType === 'video') {
        previewHTML = `<div class="file-preview"><video controls><source src="${result.url}" type="${file.type}"></video></div>`;
    } else if (fileType === 'audio') {
        previewHTML = `<div class="file-preview"><audio controls><source src="${result.url}" type="${file.type}"></audio></div>`;
    }
    
    resultDiv.innerHTML = `
        <h4>✅ ${file.name}</h4>
        <div class="file-url">${result.url}</div>
        <div class="file-actions">
            <button class="btn btn-copy" onclick="copyToClipboard('${result.url}')">Copy URL</button>
            <button class="btn btn-view" onclick="window.open('${result.url}', '_blank')">View File</button>
        </div>
        ${previewHTML}
    `;
    
    resultsSection.appendChild(resultDiv);
}

function displayError(filename, error) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'file-result';
    resultDiv.style.borderLeftColor = '#dc3545';
    
    resultDiv.innerHTML = `
        <h4>❌ ${filename}</h4>
        <p style="color: #dc3545;">Error: ${error}</p>
    `;
    
    resultsSection.appendChild(resultDiv);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const originalText = event.target.textContent;
        event.target.textContent = 'Copied!';
        event.target.style.background = '#28a745';
        
        setTimeout(() => {
            event.target.textContent = originalText;
            event.target.style.background = '#667eea';
        }, 1000);
    });
}
