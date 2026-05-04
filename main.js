// Vue Application
new Vue({
    el: '#app',
    data: {
        currentPage: 'dashboard',
        sidebarCollapsed: false,
        offlineMode: true,
        
        // Patient form data
        patient: {
            name: '',
            nationalID: '',
            dob: '',
            phone: '',
            notes: '',
            age: '',
            gender: '',
            type: 'new'
        },
        
        // Patients array
        patients: [],
        queueCounter: 1,
        
        // Stats
        totalCheckedIn: 18,
        waitingCount: 7,
        servedCount: 11,
        newPatientsCount: 0,
        returningCount: 0,
        
        // Search
        searchQuery: '',
        
        // Appointments
        appointments: [],
        
        // Settings
        clinicSettings: {
            name: "Patience's Clinic Care",
            email: "contact@patienceclinic.com",
            phone: "+1-800-CLINIC",
            autoSave: true,
            notifications: true
        }
    },
    
    computed: {
        currentDate() {
            const date = new Date();
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        },
        
        recentPatients() {
            return this.patients.slice(0, 5);
        },
        
        filteredPatients() {
            if (!this.searchQuery) return this.patients;
            const query = this.searchQuery.toLowerCase();
            return this.patients.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.nationalID.includes(query)
            );
        },
        
        completionRate() {
            if (this.totalCheckedIn === 0) return 0;
            return Math.round((this.servedCount / this.totalCheckedIn) * 100);
        },
        
        avgWaitTime() {
            // Calculate average wait time (simulated)
            return Math.floor(Math.random() * 15) + 5;
        }
    },
    
    methods: {
        // Register new patient
        registerPatient() {
            // Validation
            if (!this.patient.name) {
                alert('❌ Please enter patient full name');
                return;
            }
            
            if (!this.patient.nationalID) {
                alert('❌ Please enter National ID');
                return;
            }
            
            if (!/^\d{11}$/.test(this.patient.nationalID)) {
                alert('❌ National ID must be exactly 11 digits');
                return;
            }
            
            // Create new patient
            const newPatient = {
                id: Date.now(),
                queueNumber: this.queueCounter++,
                name: this.patient.name,
                nationalID: this.patient.nationalID,
                dob: this.patient.dob,
                phone: this.patient.phone,
                notes: this.patient.notes,
                age: this.patient.age,
                gender: this.patient.gender,
                type: this.patient.type,
                status: 'waiting',
                checkinTime: new Date().toLocaleTimeString()
            };
            
            // Add to patients array
            this.patients.unshift(newPatient);
            
            // Update stats
            this.totalCheckedIn++;
            this.waitingCount++;
            
            if (this.patient.type === 'new') {
                this.newPatientsCount++;
            } else {
                this.returningCount++;
            }
            
            // Show success message
            alert(`✅ ${this.patient.name} registered successfully!\nQueue Number: #${newPatient.queueNumber}`);
            
            // Save data
            this.saveToLocalStorage();
            
            // Reset form
            this.resetForm();
        },
        
        // Reset form
        resetForm() {
            this.patient = {
                name: '',
                nationalID: '',
                dob: '',
                phone: '',
                notes: '',
                age: '',
                gender: '',
                type: 'new'
            };
        },
        
        // Serve patient
        servePatient(patientId) {
            const patient = this.patients.find(p => p.id === patientId);
            if (patient && patient.status === 'waiting') {
                patient.status = 'served';
                this.waitingCount--;
                this.servedCount++;
                this.saveToLocalStorage();
                alert(`✅ ${patient.name} has been served!`);
            }
        },
        
        // Delete patient
        deletePatient(patientId) {
            if (confirm('⚠️ Are you sure you want to remove this patient?')) {
                const patient = this.patients.find(p => p.id === patientId);
                const index = this.patients.findIndex(p => p.id === patientId);
                
                if (index !== -1) {
                    if (patient.status === 'waiting') {
                        this.waitingCount--;
                    } else {
                        this.servedCount--;
                    }
                    this.patients.splice(index, 1);
                    this.totalCheckedIn--;
                    this.saveToLocalStorage();
                    alert('🗑️ Patient removed from system');
                }
            }
        },
        
        // View queue
        viewQueue() {
            const waiting = this.patients.filter(p => p.status === 'waiting');
            if (waiting.length === 0) {
                alert('📋 Queue is empty');
            } else {
                let message = `📋 Current Queue (${waiting.length} waiting):\n\n`;
                waiting.forEach((p, i) => {
                    message += `${i+1}. #${p.queueNumber} - ${p.name}\n`;
                });
                alert(message);
            }
        },
        
        // Toggle offline mode
        toggleOfflineMode() {
            this.offlineMode = !this.offlineMode;
            const status = this.offlineMode ? 'OFFLINE' : 'ONLINE';
            alert(`📡 Switched to ${status} mode\nAll data is stored locally on this device`);
        },
        
        // Backup data
        backupData() {
            const data = {
                patients: this.patients,
                queueCounter: this.queueCounter,
                totalCheckedIn: this.totalCheckedIn,
                waitingCount: this.waitingCount,
                servedCount: this.servedCount,
                appointments: this.appointments,
                clinicSettings: this.clinicSettings
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert('✅ Data backup completed successfully!');
        },
        
        // Show about
        showAbout() {
            alert(`🏥 Patience's Clinic Care\n\nVersion: 1.0.0\n\nDigital Patient Check-in System\nOffline Capable\nAll data stored locally\n\n© 2024 Patience's Clinic Care\nServing our community with care`);
        },
        
        // Add sample appointment
        addSampleAppointment() {
            const sampleApt = {
                id: Date.now(),
                patientName: "Sample Patient",
                date: new Date().toLocaleDateString(),
                time: "10:00 AM",
                reason: "Regular checkup"
            };
            this.appointments.push(sampleApt);
            this.saveToLocalStorage();
        },
        
        // Export report
        exportReport() {
            const report = `
CLINIC REPORT - ${this.currentDate}
====================================
Total Checked-in: ${this.totalCheckedIn}
Currently Waiting: ${this.waitingCount}
Patients Served: ${this.servedCount}
Completion Rate: ${this.completionRate}%
New Patients: ${this.newPatientsCount}
Returning Patients: ${this.returningCount}
Average Wait Time: ${this.avgWaitTime} min
====================================
Generated by Patience's Clinic Care System
            `;
            
            const blob = new Blob([report], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clinic_report_${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert('📊 Report exported successfully!');
        },
        
        // Export all data
        exportAllData() {
            this.backupData();
        },
        
        // Clear all data
        clearAllData() {
            if (confirm('⚠️ DANGER: This will delete ALL patient data! This cannot be undone. Are you ABSOLUTELY sure?')) {
                if (confirm('⚠️ FINAL WARNING: Type "DELETE" to confirm')) {
                    const confirmation = prompt('Type "DELETE" to confirm data deletion:');
                    if (confirmation === 'DELETE') {
                        this.patients = [];
                        this.queueCounter = 1;
                        this.totalCheckedIn = 0;
                        this.waitingCount = 0;
                        this.servedCount = 0;
                        this.newPatientsCount = 0;
                        this.returningCount = 0;
                        this.appointments = [];
                        this.saveToLocalStorage();
                        alert('🗑️ All data has been cleared!');
                    } else {
                        alert('❌ Deletion cancelled - incorrect confirmation');
                    }
                }
            }
        },
        
        // Save to localStorage
        saveToLocalStorage() {
            const data = {
                patients: this.patients,
                queueCounter: this.queueCounter,
                totalCheckedIn: this.totalCheckedIn,
                waitingCount: this.waitingCount,
                servedCount: this.servedCount,
                newPatientsCount: this.newPatientsCount,
                returningCount: this.returningCount,
                appointments: this.appointments,
                clinicSettings: this.clinicSettings
            };
            localStorage.setItem('clinicCareData', JSON.stringify(data));
        },
        
        // Load from localStorage
        loadFromLocalStorage() {
            const saved = localStorage.getItem('clinicCareData');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.patients = data.patients || [];
                    this.queueCounter = data.queueCounter || 1;
                    this.totalCheckedIn = data.totalCheckedIn || 0;
                    this.waitingCount = data.waitingCount || 0;
                    this.servedCount = data.servedCount || 0;
                    this.newPatientsCount = data.newPatientsCount || 0;
                    this.returningCount = data.returningCount || 0;
                    this.appointments = data.appointments || [];
                    if (data.clinicSettings) this.clinicSettings = data.clinicSettings;
                } catch(e) {
                    console.log('Error loading saved data');
                }
            }
            
            // Add sample data if empty
            if (this.patients.length === 0 && this.totalCheckedIn === 0) {
                this.addSampleData();
            }
        },
        
        // Add sample data
        addSampleData() {
            const samples = [
                { name: 'John Doe', nationalID: '12345678901', phone: '555-0101', age: '32', gender: 'Male', type: 'new', status: 'waiting' },
                { name: 'Jane Smith', nationalID: '12345678902', phone: '555-0102', age: '28', gender: 'Female', type: 'returning', status: 'served' },
                { name: 'Robert Johnson', nationalID: '12345678903', phone: '555-0103', age: '45', gender: 'Male', type: 'new', status: 'waiting' },
                { name: 'Maria Garcia', nationalID: '12345678904', phone: '555-0104', age: '35', gender: 'Female', type: 'returning', status: 'served' }
            ];
            
            samples.forEach(sample => {
                const newPatient = {
                    id: Date.now() + Math.random(),
                    queueNumber: this.queueCounter++,
                    checkinTime: new Date().toLocaleTimeString(),
                    ...sample
                };
                this.patients.push(newPatient);
                if (sample.status === 'waiting') {
                    this.waitingCount++;
                } else {
                    this.servedCount++;
                }
                this.totalCheckedIn++;
                if (sample.type === 'new') {
                    this.newPatientsCount++;
                } else {
                    this.returningCount++;
                }
            });
            
            this.saveToLocalStorage();
        }
    },
    
    mounted() {
        this.loadFromLocalStorage();
        console.log('🏥 Patience\'s Clinic Care System Started');
        console.log(`📊 Stats: Total: ${this.totalCheckedIn}, Waiting: ${this.waitingCount}, Served: ${this.servedCount}`);
    }
});