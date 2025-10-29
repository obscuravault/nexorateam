// script.js
let data = [];
let player = null;
let ytScriptLoaded = false;

async function fetchData() {
    if (data.length > 0) return data;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/Sheet1!A2:G?key=${CONFIG.API_KEY}`;
    const response = await fetch(url);
    const json = await response.json();
    data = json.values.map(row => ({
        teacher: row[0],
        subject: row[1],
        lesson: row[2],
        subLesson: row[3],
        subLessonPart: row[4],
        videoLink: row[5],
        thumbnail: row[6]
    }));
    return data;
}

function getUniqueTutors() {
    const tutors = new Set(data.map(item => item.teacher));
    return Array.from(tutors);
}

function getUniqueSubjects() {
    const subjects = new Set(data.map(item => item.subject));
    return Array.from(subjects);
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

window.onYouTubeIframeAPIReady = function() {
    // Player is ready to be created when needed
};

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
    await fetchData();
    const tutors = getUniqueTutors();
    const list = document.getElementById('tutors-list');
    tutors.forEach(tutor => {
        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.textContent = tutor;
        list.appendChild(item);
    });
}

async function loadCourses() {
    await fetchData();
    const subjects = getUniqueSubjects();
    const filter = document.getElementById('subject-filter');
    subjects.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub;
        option.textContent = sub;
        filter.appendChild(option);
    });

    function displayCourses(selectedSubject = '') {
        const list = document.getElementById('courses-list');
        list.innerHTML = '';
        const filteredSubjects = selectedSubject ? [selectedSubject] : subjects;
        filteredSubjects.forEach(sub => {
            const courseData = data.filter(item => item.subject === sub);
            const thumbnail = courseData[0]?.thumbnail || 'https://via.placeholder.com/300x200';
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

    displayCourses();
    filter.addEventListener('change', (e) => displayCourses(e.target.value));
}

async function loadCourseContent() {
    loadYouTubeAPI();
    await fetchData();
    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    if (!subject) {
        document.getElementById('course-title').textContent = 'No course selected';
        return;
    }
    document.getElementById('course-title').textContent = subject;
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
                    <img src="${part.thumbnail || 'https://via.placeholder.com/100x60'}" alt="${part.subLessonPart}" style="width: 100px; height: 60px; margin-right: 10px;">
                    <a href="#" class="flex-grow-1" onclick="createPlayer('${getVideoId(part.videoLink)}'); return false;">${part.subLessonPart}</a>
                </li>
            `).join('');
            subAccordion.innerHTML += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-${subId}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${subId}" aria-expanded="false" aria-controls="collapse-${subId}">
                            ${subLesson}
                        </button>
                    </h2>
                    <div id="collapse-${subId}" class="accordion-collapse collapse" aria-labelledby="heading-${subId}">
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
            <h2 class="accordion-header" id="heading-${lessonId}">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${lessonId}" aria-expanded="true" aria-controls="collapse-${lessonId}">
                    ${lesson}
                </button>
            </h2>
            <div id="collapse-${lessonId}" class="accordion-collapse collapse show" aria-labelledby="heading-${lessonId}">
                <div class="accordion-body">
                    ${subAccordion.innerHTML}
                </div>
            </div>
        `;
        accordion.appendChild(item);
        index++;
    }

    document.getElementById('enroll-btn').addEventListener('click', () => {
        alert('You have enrolled in ' + subject + '!');
    });
}
