// API Base URL
const API_URL = window.location.origin;

// DOM Elements
const mongoUri = document.getElementById('mongoUri');
const connectBtn = document.getElementById('connectBtn');
const connectionStatus = document.getElementById('connectionStatus');
const dashboardSection = document.getElementById('dashboardSection');
const dashboardCount = document.getElementById('dashboardCount');
const dashboardForm = document.getElementById('dashboardForm');
const dashboardId = document.getElementById('dashboardId');
const guildIDInput = document.getElementById('guildID');
const urlInput = document.getElementById('url');
const portInput = document.getElementById('port');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// State
let isConnected = false;

// Show status message
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'status-message show ' + type;
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// Connect to MongoDB
connectBtn.addEventListener('click', async () => {
    const uri = mongoUri.value.trim();
    
    if (!uri) {
        showStatus(connectionStatus, '❌ Please enter a MongoDB URI', 'error');
        return;
    }
    
    connectBtn.disabled = true;
    connectBtn.textContent = '⏳ Connecting...';
    
    try {
        const response = await fetch(`${API_URL}/api/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uri })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            isConnected = true;
            showStatus(connectionStatus, '✅ ' + data.message, 'success');
            connectBtn.textContent = '✅ Connected';
            connectBtn.style.background = '#4caf50';
            
            // Load dashboards
            await loadDashboards();
        } else {
            showStatus(connectionStatus, '❌ ' + (data.error || 'Connection failed'), 'error');
            connectBtn.disabled = false;
            connectBtn.innerHTML = '<span class="btn-icon">🔌</span> Connect to Database';
        }
    } catch (error) {
        showStatus(connectionStatus, '❌ Connection failed: ' + error.message, 'error');
        connectBtn.disabled = false;
        connectBtn.innerHTML = '<span class="btn-icon">🔌</span> Connect to Database';
    }
});

// Load dashboards from database
async function loadDashboards() {
    try {
        const response = await fetch(`${API_URL}/api/dashboards`);
        const data = await response.json();
        
        if (!response.ok) {
            showStatus(connectionStatus, '❌ ' + (data.error || 'Failed to load dashboards'), 'error');
            return;
        }
        
        // Show dashboard section
        dashboardSection.classList.remove('hidden');
        
        if (data.count === 0) {
            dashboardCount.innerHTML = `
                <div class="alert alert-info">
                    ℹ️ No dashboard records found in the database.
                </div>
            `;
            dashboardForm.classList.add('hidden');
        } else if (data.count === 1) {
            // Single record - show form
            const dashboard = data.dashboards[0];
            dashboardCount.innerHTML = `
                <div style="color: var(--accent-success); font-weight: 600;">
                    ✅ Found 1 dashboard record
                </div>
            `;
            
            // Populate form
            dashboardId.value = dashboard._id;
            guildIDInput.value = dashboard.guildID || '';
            urlInput.value = dashboard.url || '';
            portInput.value = dashboard.port || '';
            
            dashboardForm.classList.remove('hidden');
        } else {
            // Multiple records
            dashboardCount.innerHTML = `
                <div class="alert alert-info">
                    ⚠️ Found ${data.count} dashboard records in the database.
                    <br><br>
                    <strong>Records:</strong>
                    <ul style="margin-top: 10px; margin-left: 20px;">
                        ${data.dashboards.map(d => `
                            <li style="margin-bottom: 10px;">
                                <strong>ID:</strong> ${d._id}<br>
                                <strong>Guild ID:</strong> ${d.guildID || 'N/A'}<br>
                                <strong>URL:</strong> ${d.url || 'N/A'}<br>
                                <strong>Port:</strong> ${d.port || 'N/A'}
                            </li>
                        `).join('')}
                    </ul>
                    <br>
                    <em>💡 Multiple records detected. Please manually clean up your database to have only one dashboard record, then reconnect.</em>
                </div>
            `;
            dashboardForm.classList.add('hidden');
        }
    } catch (error) {
        showStatus(connectionStatus, '❌ Failed to load dashboards: ' + error.message, 'error');
    }
}

// Save dashboard changes
saveBtn.addEventListener('click', async () => {
    const id = dashboardId.value;
    const guildID = guildIDInput.value.trim();
    const url = urlInput.value.trim();
    const port = portInput.value.trim();
    
    if (!guildID || !url || !port) {
        showStatus(saveStatus, '❌ Please fill in all fields', 'error');
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Saving...';
    
    try {
        const response = await fetch(`${API_URL}/api/dashboards/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ guildID, url, port })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus(saveStatus, '✅ Dashboard updated successfully!', 'success');
            saveBtn.innerHTML = '<span class="btn-icon">💾</span> Save Changes';
            saveBtn.disabled = false;
        } else {
            showStatus(saveStatus, '❌ ' + (data.error || 'Failed to save changes'), 'error');
            saveBtn.innerHTML = '<span class="btn-icon">💾</span> Save Changes';
            saveBtn.disabled = false;
        }
    } catch (error) {
        showStatus(saveStatus, '❌ Failed to save: ' + error.message, 'error');
        saveBtn.innerHTML = '<span class="btn-icon">💾</span> Save Changes';
        saveBtn.disabled = false;
    }
});

// Allow Enter key to connect
mongoUri.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !connectBtn.disabled) {
        connectBtn.click();
    }
});
