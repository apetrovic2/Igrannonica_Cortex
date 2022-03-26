import { Component, OnInit} from "@angular/core";
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js';
import { CookieService } from "ngx-cookie-service";
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { layer } from "src/app/models/layer.model";
import { neuron } from "src/app/models/neuron.model";

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.scss"]
})

export class DashboardComponent implements OnInit {

  public canvas: any;
  public ctx;
  public data: any;
  public chart_labels: any;
  public label: string = "loss";
  public myChartData;
  public buttons: any = [];

  public problemType: string = "Regression";
  public activationFunction: string = "sigmoid";
  public optimizer: string = "Adam";
  public learningRate: number = 0.0001;
  public regularization: string = "None";
  public regularizationRate: number = 0;
  public lossFunction: string;
  public metrics: any = [];
  public epochs: number = 1;
  public range: number = 50;

  public modelHistory: any;

  public layersLabel: number = 1;
  public neurons: any = [];

  layer = new layer(1);
  neuron = new neuron(1);

  layerList = [];
  neuronsList = [1,1,1,1,1,1];
  neuronsMatrix = [[],[],[],[],[],[],[],[]];

  public fileName: string = this.cookieService.get('filename');

  dropdownList = [];
  selectedItems = [];
  dropdownSettings:IDropdownSettings = {};

  constructor(private cookieService:CookieService, private http:HttpClient) { }

  get() {
    return sessionStorage.getItem('username');
  }

  onLogout() {
    this.cookieService.deleteAll();
  }

  increaseLayers(){
    if(this.layersLabel < 6) {
      this.layersLabel++;
      this.layer = new layer(this.layersLabel);
      this.layerList.push(this.layer);
    }
  }

  decreaseLayers(index){
    if(this.layersLabel > 1) {
      this.layersLabel--;
      this.layerList.splice(index);
      this.neuronsList[index] = 1;
      this.neuronsMatrix[index].splice(1);
    }
  }

  increaseNeurons(index){
    if(this.neuronsList[index] < 8) {
      this.neuronsList[index]++;
      this.neuron = new neuron(this.neuronsList[index]);
      this.neuronsMatrix[index].push(this.neuron);
    }
  }

  decreaseNeurons(index, i){
    if(this.neuronsList[index] > 1){
      this.neuronsList[index]--;
      this.neuronsMatrix[index].splice(i-1);
    }
  }
  

  checkProblemType() {
    if(this.problemType == "Regression"){
      this.lossFunction = "mean_squared_error";
      this.dropdownList = [
        {item_id: "mse", item_text: 'Mean Squared Error'},
        {item_id: "msle", item_text: 'Mean Squared Logarithmic Error'},
        {item_id: "mae", item_text: 'Mean Absolute Error'},
        {item_id: "mape", item_text: 'Mean Absolute Percentage Error'},
        {item_id: "cosine", item_text: 'Cosine Proximity'},
        {item_id: "logcosh", item_text: 'Log Cosh Error'}
      ];
      this.selectedItems = [];
      this.metrics = this.selectedItems;
    }
    else {
      this.lossFunction = "binary_crossentropy";
      this.dropdownList = [
        {item_id: "binary_accuracy", item_text: 'Binary Accuracy'},
        {item_id: "categorical_accuracy", item_text: 'Categorical Accuracy'},
        {item_id: "sparse_categorical_accuracy", item_text: 'Sparse Categorical Accuracy'},
        {item_id: "top_k_accuracy", item_text: 'Top K Accuracy'},
        {item_id: "sparse_top_k_categorical_accuracy", item_text: 'Sparse Top K Categorical Accuracy'},
        {item_id: "accuracy", item_text: 'Accuracy'}
      ];
      this.selectedItems = [];
      this.metrics = this.selectedItems;
    }
  }

  multiselect(){
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 6,
      allowSearchFilter: false
    };
  }

  proba(){
    this.http.get("https://localhost:7219/api/PythonComm/testiranje").subscribe(
      (response) => {
        this.modelHistory = response;
        console.log(Object.keys(this.modelHistory));
        this.buttons = Object.keys(this.modelHistory);
        this.data = this.modelHistory['loss'];
        this.chart_labels = [];
        for (let i = 0; i < this.data.length; i++) {
          this.chart_labels[i] = i + 1;
        }
        this.updateOptions();
      }
    )
  }

  changeData(name){
    this.data = this.modelHistory[name];
    this.label = name;
    this.updateOptions();
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  ngOnInit() {
    
    this.multiselect();
    this.checkProblemType();
    this.layer.id = 1;
    this.layerList.push(this.layer);
    
    for (let i = 0; i < this.neuronsMatrix.length; i++) {
      this.neuron = new neuron(1);
      this.neuronsMatrix[i].push(neuron);
    }

  
  if (!(this.get())) this.onLogout();

    var gradientChartOptionsConfigurationWithTooltipRed: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 60,
            suggestedMax: 125,
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    this.chart_labels = [];

    this.canvas = document.getElementById("chartBig1");
    this.ctx = this.canvas.getContext("2d");

    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(212,80,217,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(212,80,217,0.0)');
    gradientStroke.addColorStop(0, 'rgba(212,80,217,0)'); //red colors

    var config = {
      type: 'line',
      data: {
        labels: this.chart_labels,
        datasets: [{
          label: this.label,
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: '#d450d9',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#d450d9',
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: '#d450d9',
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: this.data,
        }]
      },
      options: gradientChartOptionsConfigurationWithTooltipRed
    };
    this.myChartData = new Chart(this.ctx, config);
  }
  public updateOptions() {
    this.myChartData.data.datasets[0].data = this.data;
    this.myChartData.data.datasets[0].label = this.label;
    console.log(this.label);
    this.myChartData.data.labels = this.chart_labels;
    this.myChartData.update();
  }
}
