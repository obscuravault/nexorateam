// script.js
let data = [];
let tutorsData = [];
let player = null;
let ytScriptLoaded = false;

async function fetchData() {
    if (data.length > 0) return data;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/Sheet1!A2:H?key=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    const json = await response.json();
    data = json.values ? json.values.map(row => ({
        teacherId: row[0],
        courseType: row[1],
        subject: row[2],
        lesson: row[3],
        subLesson: row[4],
        subLessonPart: row[5],
        videoLink: row[6],
        thumbnail: row[7] || 'https://via.placeholder.com/300x200'
    })) : [];
    return data;
}

async function fetchTutors() {
    if (tutorsData.length > 0) return tutorsData;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/tutors!A2:E?key=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    const json = await response.json();
    tutorsData = json.values ? json.values.map(row => ({
        id: row[0],
        name: row[1],
        bio: row[2],
        photo: row[3] || 'https://via.placeholder.com/150',
        website: row[4]
    })) : [];
    return tutorsData;
}

function getTutorById(id) {
    return tutorsData.find(t => t.id === id) || {name: 'Unknown', photo: 'https://via.placeholder.com/150', website: '#'};
}

function getUniqueSubjects() {
    const subjects = new Set(data.map(item => item.subject));
    return Array.from(subjects);
}

function getUniqueCourseTypes() {
    const types = new Set(data.map(item => item.courseType));
    return Array.from(types);
}

function getUniqueTeachers() {
    return tutorsData;
}

function groupBySubject(subject) {
    const filtered = data.filter(item => item.subject === subject);
    const grouped = filtered.reduce((acc, item) => {
        if (!acc[item.lesson]) acc[item.lesson] = {};
        if (!acc[item.lesson][item.subLesson]) acc[item.lesson][item.subLesson] = [];
        acc[item.lesson][item.subLesson].push(item);
        return acc;
    }, {});
    return grouped;
}

function getVideoId(url) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
}

function loadYouTubeAPI() {
    if (ytScriptLoaded) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);
    ytScriptLoaded = true;
}

window.onYouTubeIframeAPIReady = function() {};

function createPlayer(videoId) {
    if (player) player.destroy();
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'controls': 0,
            'modestbranding': 1,
            'rel': 0,
            'fs': 0,
            'showinfo': 0
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    document.getElementById('custom-controls').style.display = 'block';
    document.getElementById('play-btn').onclick = () => player.playVideo();
    document.getElementById('pause-btn').onclick = () => player.pauseVideo();
}

async function loadTutors() {
    await fetchTutors();
    const list = document.getElementById('tutors-list');
    tutorsData.forEach(tutor => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        col.innerHTML = `
            <div class="card">
                <img src="${tutor.photo}" class="card-img-top" alt="${tutor.name}">
                <div class="card-body">
                    <h5 class="card-title">${tutor.name}</h5>
                    <p class="card-text">${tutor.bio || 'Expert tutor in advanced level subjects.'}</p>
                    <a href="${tutor.website}" class="btn btn-primary" target="_blank">Website</a>
                    <a href="courses.html?teacher=${tutor.id}" class="btn btn-secondary">Courses</a>
                </div>
            </div>
        `;
        list.appendChild(col);
    });
}

async function loadCourses() {
    await fetchData();
    await fetchTutors();
    const subjects = getUniqueSubjects();
    const courseTypes = getUniqueCourseTypes();
    const teachers = getUniqueTeachers();

    const subjectFilter = document.getElementById('subject-filter');
    subjects.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub;
        option.textContent = sub;
        subjectFilter.appendChild(option);
    });

    const teacherFilter = document.getElementById('teacher-filter');
    teachers.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.name;
        teacherFilter.appendChild(option);
    });

    const courseTypeFilter = document.getElementById('coursetype-filter');
    courseTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        courseTypeFilter.appendChild(option);
    });

    const params = new URLSearchParams(window.location.search);
    const selectedTeacher = params.get('teacher') || '';

    function displayCourses(filters = {}) {
        const list = document.getElementById('courses-list');
        list.innerHTML = '';
        let filteredData = data;
        if (filters.subject) filteredData = filteredData.filter(d => d.subject === filters.subject);
        if (filters.teacher) filteredData = filteredData.filter(d => d.teacherId === filters.teacher);
        if (filters.courseType) filteredData = filteredData.filter(d => d.courseType === filters.courseType);
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredData = filteredData.filter(d => d.subject.toLowerCase().includes(searchLower) || d.lesson.toLowerCase().includes(searchLower));
        }

        const uniqueSubjects = [...new Set(filteredData.map(d => d.subject))];
        uniqueSubjects.forEach(sub => {
            const courseData = filteredData.find(d => d.subject === sub);
            const thumbnail = courseData.thumbnail;
            const teacherName = getTutorById(courseData.teacherId).name;
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-3';
            col.innerHTML = `
                <div class="card">
                    <img src="${thumbnail}" class="card-img-top" alt="${sub}">
                    <div class="card-body">
                        <h5 class="card-title">${sub}</h5>
                        <p class="card-text">Type: ${courseData.courseType} | Teacher: ${teacherName}</p>
                        <a href="course-content.html?subject=${encodeURIComponent(sub)}" class="btn btn-primary">View Course</a>
                    </div>
                </div>
            `;
            list.appendChild(col);
        });
    }

    displayCourses({teacher: selectedTeacher});

    subjectFilter.addEventListener('change', (e) => displayCourses({
        subject: e.target.value,
        teacher: teacherFilter.value,
        courseType: courseTypeFilter.value,
        search: searchInput.value
    }));
    teacherFilter.addEventListener('change', (e) => displayCourses({
        subject: subjectFilter.value,
        teacher: e.target.value,
        courseType: courseTypeFilter.value,
        search: searchInput.value
    }));
    courseTypeFilter.addEventListener('change', (e) => displayCourses({
        subject: subjectFilter.value,
        teacher: teacherFilter.value,
        courseType: e.target.value,
        search: searchInput.value
    }));

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => displayCourses({
        subject: subjectFilter.value,
        teacher: teacherFilter.value,
        courseType: courseTypeFilter.value,
        search: e.target.value
    }));

    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    gridBtn.addEventListener('click', () => {
        list.classList.add('grid-view');
        list.classList.remove('list-view');
    });
    listBtn.addEventListener('click', () => {
        list.classList.add('list-view');
        list.classList.remove('grid-view');
    });
}

async function loadCourseContent() {
    await fetchData();
    await fetchTutors();
    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    if (!subject) {
        document.getElementById('course-title').textContent = 'No course selected';
        return;
    }
    document.getElementById('course-title').textContent = subject;
    const courseData = data.find(d => d.subject === subject);
    if (!courseData) return;
    const teacher = getTutorById(courseData.teacherId);
    document.getElementById('teacher-photo').src = teacher.photo;
    document.getElementById('teacher-name').textContent = teacher.name;
    document.getElementById('course-desc').textContent = `Explore advanced topics in ${subject}. Ideal for 2025 A/L preparation.`;

    document.getElementById('enroll-btn').addEventListener('click', () => alert(`Enrolled in ${subject}!`));

    const grouped = groupBySubject(subject);
    const accordion = document.getElementById('course-content');
    let index = 0;
    for (const lesson in grouped) {
        const lessonId = `lesson${index}`;
        const subAccordion = document.createElement('div');
        subAccordion.className = 'accordion accordion-flush';
        let subIndex = 0;
        for (const subLesson in grouped[lesson]) {
            const subId = `${lessonId}-sub${subIndex}`;
            const parts = grouped[lesson][subLesson];
            const partsList = parts.map(part => `
                <li class="list-group-item d-flex align-items-center">
                    <img src="${part.thumbnail}" alt="${part.subLessonPart}" style="width: 100px; height: 60px; margin-right: 10px;">
                    <a href="video-player.html?videoLink=${encodeURIComponent(part.videoLink)}&subject=${encodeURIComponent(subject)}" class="flex-grow-1">${part.subLessonPart}</a>
                </li>
            `).join('');
            subAccordion.innerHTML += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${subId}">
                            ${subLesson}
                        </button>
                    </h2>
                    <div id="collapse-${subId}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <ul class="list-group">${partsList}</ul>
                        </div>
                    </div>
                </div>
            `;
            subIndex++;
        }
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
            <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${lessonId}" aria-expanded="true">
                    ${lesson}
                </button>
            </h2>
            <div id="collapse-${lessonId}" class="accordion-collapse collapse show">
                <div class="accordion-body">
                    ${subAccordion.innerHTML}
                </div>
            </div>
        `;
        accordion.appendChild(item);
        index++;
    }

    // Related courses by teacher
    const relatedList = document.getElementById('related-list');
    const otherSubjects = [...new Set(data.filter(d => d.teacherId === courseData.teacherId && d.subject !== subject).map(d => d.subject))];
    otherSubjects.forEach(sub => {
        const relData = data.find(d => d.subject === sub);
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        col.innerHTML = `
            <div class="card">
                <img src="${relData.thumbnail}" class="card-img-top" alt="${sub}">
                <div class="card-body">
                    <h5 class="card-title">${sub}</h5>
                    <a href="course-content.html?subject=${encodeURIComponent(sub)}" class="btn btn-primary">View Course</a>
                </div>
            </div>
        `;
        relatedList.appendChild(col);
    });
}

async function loadVideoPlayer() {
    loadYouTubeAPI();
    await fetchData();
    const params = new URLSearchParams(window.location.search);
    const videoLink = params.get('videoLink');
    const subject = params.get('subject');
    if (!videoLink || !subject) {
        document.getElementById('video-title').textContent = 'No video selected';
        return;
    }
    const currentItem = data.find(d => d.videoLink === videoLink && d.subject === subject);
    if (!currentItem) return;
    document.getElementById('video-title').textContent = currentItem.subLessonPart;

    createPlayer(getVideoId(videoLink));

    // Next videos
    const subjectData = data.filter(d => d.subject === subject);
    const currentIndex = subjectData.findIndex(d => d.videoLink === videoLink);
    const nextVideos = subjectData.slice(currentIndex + 1);
    const nextList = document.getElementById('next-list');
    nextVideos.forEach(video => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        col.innerHTML = `
            <div class="card">
                <img src="${video.thumbnail}" class="card-img-top" alt="${video.subLessonPart}">
                <div class="card-body">
                    <h5 class="card-title">${video.subLessonPart}</h5>
                    <a href="video-player.html?videoLink=${encodeURIComponent(video.videoLink)}&subject=${encodeURIComponent(subject)}" class="btn btn-primary">Watch Next</a>
                </div>
            </div>
        `;
        nextList.appendChild(col);
    });
}

async function loadFeatured() {
    await fetchData();
    const subjects = getUniqueSubjects().slice(0, 3);
    const list = document.getElementById('featured-list');
    subjects.forEach(sub => {
        const courseData = data.find(d => d.subject === sub);
        const thumbnail = courseData.thumbnail;
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        col.innerHTML = `
            <div class="card">
                <img src="${thumbnail}" class="card-img-top" alt="${sub}">
                <div class="card-body">
                    <h5 class="card-title">${sub}</h5>
                    <a href="course-content.html?subject=${encodeURIComponent(sub)}" class="btn btn-primary">View Course</a>
                </div>
            </div>
        `;
        list.appendChild(col);
    });
}

function initTheme() {
    const select = document.getElementById('theme-select');
    const savedTheme = localStorage.getItem('theme') || 'default';
    select.value = savedTheme;
    document.body.classList.add(`theme-${savedTheme}`);
    select.addEventListener('change', (e) => {
        document.body.classList.remove('theme-default', 'theme-bw', 'theme-greenwhite', 'theme-purplegold', 'theme-redblack');
        document.body.classList.add(`theme-${e.target.value}`);
        localStorage.setItem('theme', e.target.value);
    });
}
