// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // Check if user has already selected gender and theme
    const userGender = localStorage.getItem('nexoraGender');
    const userTheme = localStorage.getItem('nexoraTheme');
    
    if (!userGender || !userTheme) {
        // Show gender selection modal
        showGenderModal();
    } else {
        // Apply saved theme
        applyTheme(userGender, userTheme);
        
        // Load last studied data if exists
        loadLastStudied();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
}

function showGenderModal() {
    const modal = document.getElementById('genderModal');
    modal.style.display = 'block';
    
    // Set up gender selection
    const genderOptions = document.querySelectorAll('.gender-option');
    genderOptions.forEach(option => {
        option.addEventListener('click', function() {
            const gender = this.getAttribute('data-gender');
            showThemeOptions(gender);
        });
    });
}

function showThemeOptions(gender) {
    const themeOptions = document.getElementById('themeOptions');
    const confirmButton = document.getElementById('confirmTheme');
    
    // Clear previous options
    themeOptions.innerHTML = '';
    
    // Create theme options based on gender
    const themes = gender === 'boy' ? 
        ['boy-theme-1', 'boy-theme-2', 'boy-theme-3', 'boy-theme-4'] : 
        ['girl-theme-1', 'girl-theme-2', 'girl-theme-3', 'girl-theme-4'];
    
    const themeNames = gender === 'boy' ? 
        ['Blue Ocean', 'Emerald Forest', 'Purple Nebula', 'Crimson Blaze'] : 
        ['Pink Bloom', 'Violet Dream', 'Teal Harmony', 'Orange Sunset'];
    
    themes.forEach((theme, index) => {
        const themeOption = document.createElement('div');
        themeOption.className = 'theme-option';
        themeOption.setAttribute('data-theme', theme);
        
        // Create color swatch based on theme
        let gradient = '';
        if (theme === 'boy-theme-1') gradient = 'linear-gradient(to right, #0d47a1, #42a5f5)';
        else if (theme === 'boy-theme-2') gradient = 'linear-gradient(to right, #00695c, #4db6ac)';
        else if (theme === 'boy-theme-3') gradient = 'linear-gradient(to right, #4a148c, #ba68c8)';
        else if (theme === 'boy-theme-4') gradient = 'linear-gradient(to right, #b71c1c, #f44336)';
        else if (theme === 'girl-theme-1') gradient = 'linear-gradient(to right, #880e4f, #f06292)';
        else if (theme === 'girl-theme-2') gradient = 'linear-gradient(to right, #4a148c, #b388ff)';
        else if (theme === 'girl-theme-3') gradient = 'linear-gradient(to right, #00695c, #80cbc4)';
        else if (theme === 'girl-theme-4') gradient = 'linear-gradient(to right, #e65100, #ffcc80)';
        
        themeOption.innerHTML = `
            <div class="color-swatch" style="background: ${gradient};"></div>
            <span>${themeNames[index]}</span>
        `;
        
        themeOption.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.style.borderColor = 'transparent';
            });
            
            // Add selected class to current option
            this.style.borderColor = 'var(--accent)';
            
            // Enable confirm button
            confirmButton.style.display = 'inline-block';
            
            // Store selected theme temporarily
            this.selectedTheme = theme;
            this.selectedGender = gender;
        });
        
        themeOptions.appendChild(themeOption);
    });
    
    // Show theme options
    themeOptions.style.display = 'grid';
    
    // Set up confirm button
    confirmButton.onclick = function() {
        const selectedOption = document.querySelector('.theme-option[style*="border-color"]');
        if (selectedOption) {
            const theme = selectedOption.selectedTheme;
            const gender = selectedOption.selectedGender;
            
            // Save to localStorage
            localStorage.setItem('nexoraGender', gender);
            localStorage.setItem('nexoraTheme', theme);
            
            // Apply theme
            applyTheme(gender, theme);
            
            // Hide modal
            document.getElementById('genderModal').style.display = 'none';
        }
    };
}

function applyTheme(gender, theme) {
    // Remove any existing theme classes
    document.body.classList.remove(
        'boy-theme-1', 'boy-theme-2', 'boy-theme-3', 'boy-theme-4',
        'girl-theme-1', 'girl-theme-2', 'girl-theme-3', 'girl-theme-4'
    );
    
    // Add the selected theme class
    document.body.classList.add(theme);
}

function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('nav a, .hero-buttons a, .footer-section a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                showPage(page);
            }
        });
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', function() {
        showGenderModal();
    });
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName + 'Page').classList.add('active');
    
    // Add active class to corresponding nav link
    document.querySelector(`nav a[data-page="${pageName}"]`).classList.add('active');
    
    // Load page-specific content
    if (pageName === 'courses') {
        loadCoursesPage();
    } else if (pageName === 'tutors') {
        loadTutorsPage();
    } else if (pageName === 'home') {
        loadHomePage();
    }
}

function loadInitialData() {
    // Load featured courses for home page
    loadFeaturedCourses();
    
    // Load tutors for home page
    loadFeaturedTutors();
}

function loadFeaturedCourses() {
    // In a real implementation, this would fetch from Google Sheets
    // For now, we'll use mock data
    
    const courses = [
        {
            id: 1,
            title: 'Quantum Mechanics Fundamentals',
            subject: 'Physics',
            teacher: 'Dr. Darshana Ukuwela',
            thumbnail: 'physics',
            description: 'Explore the fascinating world of quantum physics and its applications.'
        },
        {
            id: 2,
            title: 'Organic Chemistry Reactions',
            subject: 'Chemistry',
            teacher: 'Prof. Anura Perera',
            thumbnail: 'chemistry',
            description: 'Master the key reactions in organic chemistry with practical examples.'
        },
        {
            id: 3,
            title: 'Cell Biology & Genetics',
            subject: 'Biology',
            teacher: 'Dr. Nirmali Fernando',
            thumbnail: 'biology',
            description: 'Dive deep into cellular structures and genetic inheritance patterns.'
        }
    ];
    
    const coursesGrid = document.querySelector('#homePage .courses-grid');
    coursesGrid.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-thumbnail" style="background: linear-gradient(to right, var(--primary), var(--secondary));">
                <i class="fas fa-${course.thumbnail}" style="font-size: 3rem; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;"></i>
            </div>
            <div class="course-content">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span><i class="fas fa-book"></i> ${course.subject}</span>
                    <span><i class="fas fa-user"></i> ${course.teacher}</span>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 15px;" onclick="showPage('courseContent')">View Course</button>
            </div>
        `;
        coursesGrid.appendChild(courseCard);
    });
}

function loadFeaturedTutors() {
    // In a real implementation, this would fetch from Google Sheets
    // For now, we'll use mock data
    
    const tutors = [
        {
            id: 1,
            name: 'Dr. Darshana Ukuwela',
            bio: 'PhD in Physics with 15 years of teaching experience',
            photo: 'user',
            website: 'https://example.com'
        },
        {
            id: 2,
            name: 'Prof. Anura Perera',
            bio: 'Senior Chemistry lecturer and researcher',
            photo: 'user',
            website: 'https://example.com'
        },
        {
            id: 3,
            name: 'Dr. Nirmali Fernando',
            bio: 'Award-winning Biology educator',
            photo: 'user',
            website: 'https://example.com'
        }
    ];
    
    // This would be used on the tutors page
}

function loadCoursesPage() {
    // Similar to loadFeaturedCourses but with more courses
    const coursesGrid = document.querySelector('#coursesPage .courses-grid');
    
    // In a real implementation, this would fetch from Google Sheets
    // For now, we'll use the same mock data
    loadFeaturedCourses(); // Reuse the function for demo
}

function loadTutorsPage() {
    const tutorsGrid = document.querySelector('#tutorsPage .tutors-grid');
    
    // In a real implementation, this would fetch from Google Sheets
    // For now, we'll use mock data
    
    const tutors = [
        {
            id: 1,
            name: 'Dr. Darshana Ukuwela',
            bio: 'PhD in Physics with 15 years of teaching experience. Specialized in Quantum Mechanics and Relativity.',
            photo: 'user',
            website: 'https://example.com'
        },
        {
            id: 2,
            name: 'Prof. Anura Perera',
            bio: 'Senior Chemistry lecturer and researcher with publications in international journals.',
            photo: 'user',
            website: 'https://example.com'
        },
        {
            id: 3,
            name: 'Dr. Nirmali Fernando',
            bio: 'Award-winning Biology educator with a focus on molecular biology and genetics.',
            photo: 'user',
            website: 'https://example.com'
        },
        {
            id: 4,
            name: 'Dr. Sanjaya Rathnayake',
            bio: 'Physics researcher with expertise in electromagnetism and thermodynamics.',
            photo: 'user',
            website: 'https://example.com'
        }
    ];
    
    tutorsGrid.innerHTML = '';
    
    tutors.forEach(tutor => {
        const tutorCard = document.createElement('div');
        tutorCard.className = 'tutor-card';
        tutorCard.innerHTML = `
            <div class="tutor-photo">
                <i class="fas fa-${tutor.photo}"></i>
            </div>
            <h3 class="tutor-name">${tutor.name}</h3>
            <p class="tutor-bio">${tutor.bio}</p>
            <div class="tutor-actions">
                <button class="btn btn-outline"><i class="fas fa-globe"></i> Website</button>
                <button class="btn btn-primary">View Courses</button>
            </div>
        `;
        tutorsGrid.appendChild(tutorCard);
    });
}

function loadLastStudied() {
    // Load the last studied lesson from localStorage
    const lastStudied = localStorage.getItem('nexoraLastStudied');
    if (lastStudied) {
        // In a real implementation, this would update the UI to show progress
        console.log('Last studied:', JSON.parse(lastStudied));
    }
}

function updateLastStudied(lessonData) {
    // Save the current lesson to localStorage
    localStorage.setItem('nexoraLastStudied', JSON.stringify(lessonData));
}

// Google Sheets integration functions (simplified for demo)
function fetchSheetData(sheetName) {
    // In a real implementation, this would use the Google Sheets API
    // For now, we'll return mock data
    
    return new Promise((resolve) => {
        setTimeout(() => {
            if (sheetName === 'Sheet1') {
                resolve([
                    ['1', 'Physics', 'Quantum Mechanics', 'Introduction', 'Wave-Particle Duality', 'Part 1', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/thumb1.jpg'],
                    ['1', 'Physics', 'Quantum Mechanics', 'Introduction', 'Wave-Particle Duality', 'Part 2', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/thumb2.jpg'],
                    ['2', 'Chemistry', 'Organic Chemistry', 'Hydrocarbons', 'Alkanes', 'Part 1', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/thumb3.jpg']
                ]);
            } else if (sheetName === 'tutors') {
                resolve([
                    ['1', 'Dr. Darshana Ukuwela', 'PhD in Physics with 15 years of teaching experience', 'https://example.com/photo1.jpg', 'https://example.com'],
                    ['2', 'Prof. Anura Perera', 'Senior Chemistry lecturer and researcher', 'https://example.com/photo2.jpg', 'https://example.com']
                ]);
            }
        }, 500);
    });
}
