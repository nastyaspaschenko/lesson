class JokesView {
    constructor() {
        this.$btn = $('#refresh');
        this.$ul = $('#jokes');
        this.$loader = $('#loader');
        this.$error = $('#err');
    }

    showJokes(arr) {
        this.$ul.html('');
        for(let i=0; i < arr.length; i++) {
            this.$ul.append(`<li>${arr[i]}</li>`);
        };
        this.$error.hide();
        this.$loader.hide();
        this.$ul.show();
    }

    showLoader() {
        this.$ul.hide();
        this.$error.hide();
        this.$loader.show();
    }

    showError(msg) {
        this.$ul.hide();
        this.$loader.hide();
        this.$error.html(msg);
        this.$error.show();
    }
}

class JokesModel {
    constructor() {
        this.url = 'https://v2.jokeapi.dev/joke/Any';
    }

    saveJokes(arr) {
        localStorage.setItem('saved_jokes', JSON.stringify(arr));
    }

    restoreJokes() {
        let saved = localStorage.getItem('saved_jokes');
        return saved ? JSON.parse(saved) : [];
    }

    loadJokes(count) {
        return this.loadJoke([], count).then(arr => {
            this.saveJokes(arr);
            return arr;
        });
    }

    loadJoke(arr, count) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.url);
            xhr.responseType = 'json';
            xhr.onload = () => {
                if(xhr.status == 200) {
                    resolve(xhr.response)
                } else {
                    reject(xhr.response)
                }
            }
            xhr.send();
        })
        .then(json => json.setup ? (json.setup + " / " + json.delivery) : json.joke)
        .then(joke => arr.push(joke))
        .then(length => length < count ? this.loadJoke(arr, count) : arr);
    }
}

class JokesController {
    constructor(view, model, countOfJokes) {
        this.view = view;
        this.model = model;
        this.refreshData = this.refreshData.bind(this);
        this.countOfJokes = countOfJokes;
    }

    hendle() {
        this.view.$btn.on('click', this.refreshData);
        this.view.showJokes(this.model.restoreJokes());
    }

    refreshData() {
        this.view.showLoader();
        this.model.loadJokes(this.countOfJokes)
                .then(arr => this.view.showJokes(arr))
                .catch(err => this.view.showError(err.message));
    }
}

$(function() {
    const jokesView = new JokesView();
    const jokesModel = new JokesModel();
    const jokesController = new JokesController(jokesView, jokesModel, 10);

    jokesController.hendle();
});
