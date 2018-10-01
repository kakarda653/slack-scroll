import React, {Component} from "react";
import '../App.css';
import axios from "axios";


class List extends Component {
    state = {
        elements: [],
        scrollTop: 0,
        number: 0,
        index: 1,
        virtualized: true,
        resize: false
    };

    componentDidMount() {
        this.loadData();
        window.addEventListener('resize', () => {
            this.setState({
                resize:true
            });
        });
    }

    componentDidUpdate() {
        const { number, elements, index, resize } = this.state;
        if(number !== 0) {
            let heightOfNewElements = 0;
            let sum = 0;
            this._list.childNodes.forEach((element, index) => {
                if(index < number) {
                    heightOfNewElements += element.offsetHeight;
                    elements[index].top = sum;
                    sum += element.offsetHeight;
                }
            });
            elements.forEach((element, index) => {
                if(index >= number) {
                    element.top += heightOfNewElements;
                }
            });
            this._list.style.height = this._list.offsetHeight + heightOfNewElements + 'px';
            this._container.scrollTop += (heightOfNewElements - 50);
            this.setState({number: 0, index: index + 1});
        }
        if(resize) {
            let sum = 0;
            this._list.childNodes.forEach((element, index) => {
                elements[index].top = sum;
                sum += element.offsetHeight;
            });
            this._list.style.height = sum + 'px';
            this.setState({resize: false});
        }
    }

    addSomeElements = (data = []) => {
        let {elements} = this.state;
        data.forEach((dataElement) => {
                let element = {
                    data: dataElement.title,
                    image: dataElement.image,
                    top: 0
                };
                elements.unshift(element);
            });
        this.setState({number: data.length});
    };

    onListScrolling = (scrollTop) =>{
        this.setState({scrollTop});
        if(scrollTop === 0) {
            this.loadData();
        }
    };

    switchRender = () => {
        this.setState((prevState) => {
            return {virtualized: !prevState.virtualized};
        });
    };

    loadData = () => {
        let id = setInterval(() => {
            axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=1e14a468e59b4140a322ea5f314b951a&page=' + this.state.index)
                .then(response => {
                    let data = response.data.articles.map(element => {
                        let image = null;
                        if(this.getRandomInt(0, 20) < 3) {
                            image = element.urlToImage;
                        }
                        return {title: element.content, image: image};
                    });
                    this.addSomeElements(data);
                    clearInterval(id);
                });
        }, 1000)
    };

    getRandomInt = (min, max) =>  {
        return Math.floor(Math.random() * (max - min)) + min;
    };



    createListEntry = (element, i) => {
        const {elements} = this.state;
        let image = element.image != null ? <div className={"image-wrapper"}><img alt={"object"} className={"image"} src={element.image} /></div> : "";
        return <div style={{top: element.top}} key={i.toString()} className="element">{elements[i].data}<br />{image}</div>
    };

    renderItems = () => {
        const {elements, scrollTop, number, virtualized, resize} = this.state;
        let visibleElements = [];
        if(elements.length > 0) {
            let startIndex = -2;
            let endIndex = -1;
            elements.forEach((element, i) => {
                if((element.top < scrollTop + this._container.offsetHeight && (element.top >= scrollTop || number > 0)) || !virtualized || resize) {
                    visibleElements.push(this.createListEntry(element, i));
                    if(startIndex === -2) {
                        startIndex = i - 1;
                    }
                    endIndex = i + 1;
                }
            });
            if(virtualized && !resize) {
                for(let i = 0; i < 4 && startIndex >= 0; i++, startIndex--) {
                    visibleElements.unshift(this.createListEntry(elements[startIndex], startIndex))
                }
                for(let i = 0; i < 5 && endIndex < elements.length; i++, endIndex++) {
                    visibleElements.push(this.createListEntry(elements[endIndex], endIndex));
                }
            }
        }
        return visibleElements;
    };

    render() {
        return (
            <div className={"container-wrapper"}>
                <div onScroll={({target: {scrollTop}}) => {this.onListScrolling(scrollTop)}} ref={(div) => {this._container = div;}} className="container">
                    <ul id={"list"} className={"list"} ref={(div) => {this._list = div;}}>
                        {this.renderItems()}
                    </ul>
                </div>
                <button onClick={this.switchRender}>Switch render</button>

            </div>
        );
    }
}

export default List;