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

    async loadJokes(count) {
        let arr = [];
        try {
            for(let i=0; i<count; i++) {
                let joke = await this.loadJoke();
                arr.push(joke);
            }
            this.saveJokes(arr);
            return arr;
        } catch(err) {
            return err;
        }
    }

    async loadJoke() {
        let result = await fetch(this.url);
        let json = await result.json();
        console.log(json);
        return json.setup ? (json.setup + " / " + json.delivery) : json.joke;
    }
}

class JokesController {
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.refreshData = this.refreshData.bind(this);
    }

    hendle() {
        this.view.$btn.on('click', this.refreshData);
        this.view.showJokes(this.model.restoreJokes());
    }

    refreshData() {
        this.view.showLoader();
        this.model.loadJokes(10)
                .then(result => result instanceof Error ? 
                    this.view.showError(result.message) : 
                    this.view.showJokes(result));
    }
}

$(function() {
    const jokesView = new JokesView();
    const jokesModel = new JokesModel();
    const jokesController = new JokesController(jokesView, jokesModel);

    jokesController.hendle();
});
