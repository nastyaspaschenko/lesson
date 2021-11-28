class JokesView {
    constructor() {
        this.$newJoke = $('#new_joke');
        this.$btnRefresh = $('#refresh');
        this.$btnSave = $('#save');
        this.$ul = $('#jokes');
    }

    showJokes(arr) {
        this.$ul.html('');
        for(let i=0; i < arr.length; i++) {
            this.addJoke(arr[i]);
        };
    }

    showNewJoke(text) {
        this.$newJoke.html(text);
    }

    addJoke(joke) {
        this.$ul.append(`<li>${joke.text}<button id="${joke._id}" class="remove">&#10006;</button></li>`);
    }
}

class JokesModel {
    constructor() {
        this.jokeUrl = 'https://v2.jokeapi.dev/joke/Any';
        this.url = 'http://localhost:3000/jokes';
    }

    async getJokes() {
        try {
            let result = await fetch(this.url);
            let json = await result.json();
            return json;
        } catch(err) {
            return err;
        }
    }

    async loadJoke() {
        try {
            let result = await fetch(this.jokeUrl);
            let json = await result.json();
            return json.setup ? (json.setup + " / " + json.delivery) : json.joke;
        } catch(err) {
            return err;
        }
    }

    async addJoke(text) {
        try {
            let result = await fetch(this.url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: text})
            });
            let json = await result.json();
            return json;
        } catch(err) {
            return err;
        }
    }

    async removeJoke(id) {
        try {
            let result = await fetch(this.url + '/' + id, {
                method: 'DELETE'
            });
            let json = await result.json();
            console.log(json);
            return json;
        } catch(err) {
            return err;
        }
    }
}

class JokesController {
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.refreshNewJoke = this.refreshNewJoke.bind(this);
        this.saveNewJoke = this.saveNewJoke.bind(this);
        this.removeJoke = this.removeJoke.bind(this);
    }

    hendle() {
        this.view.$btnRefresh.on('click', this.refreshNewJoke);
        this.view.$btnSave.on('click', this.saveNewJoke);
        this.view.$ul.on('click', 'button.remove', this.removeJoke)
        
        this.refreshJokes();
    }

    removeJoke(e) {
        let id = e.target.id;
        this.model.removeJoke(id)
            .then(result => result instanceof Error ? 
                console.log(result) : 
                this.refreshJokes()
            )
    }

    refreshJokes() {
        this.model.getJokes()
            .then(result => result instanceof Error ? 
                console.log(result) : 
                this.view.showJokes(result));
    }

    refreshNewJoke() {
        this.model.loadJoke()
                .then(result => result instanceof Error ? 
                    console.log(result) : 
                    this.view.showNewJoke(result));
    }
    saveNewJoke() {
        let text = this.view.$newJoke.text();
        if(text.length > 0) {
            this.model.addJoke(text)
                .then(result => {
                    if(result instanceof Error) return console.log(result);
                    this.view.addJoke(result);
                    this.view.$newJoke.html('');
                });
        }
    }
}

$(function() {
    const jokesView = new JokesView();
    const jokesModel = new JokesModel();
    const jokesController = new JokesController(jokesView, jokesModel, 10);

    jokesController.hendle();
});
