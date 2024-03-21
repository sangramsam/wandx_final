import { Component, OnInit, NgZone } from '@angular/core';
import {DashboardService} from '../../services/dashboard.service'

@Component({
  selector: 'dashboard-recentactivity',
  templateUrl: './dashboard-recentactivity.component.html',
  styleUrls: ['./dashboard-recentactivity.component.css']
})
export class DashboardRecentactivityComponent implements OnInit {
	public activities : any = []
	public currentPage = 1
  public filter : '';
  public hasData : boolean = false
  public noDataForFilter: boolean = false;
  private _activities = [];
  constructor(
    private zone : NgZone,
    private dashboardService : DashboardService
  ) {
    this.dashboardService.serviceStatus$.subscribe(status => {
      if (status == 'ready') {
        let tokens = this.dashboardService.getTokens()
        try {
          let activities = this.getActivities(tokens)
          this.zone.run(() => {
            this.activities = activities
            this._activities = activities
            if (this._activities.length) {
              this.hasData = true;
              this.noDataForFilter = false
            }
          })
        } catch(err) {
          console.log(err)
        }
      }
    })
  }
  updateSearchItems = () => {
    let activities = this._activities;
    if (!activities || !activities.length)
      return;
    activities = activities.filter(item => item.symbol.toLowerCase().indexOf(this.filter.toLowerCase()) != -1)
    if (!activities.length)
      this.noDataForFilter = true
    this.activities = activities
  }
  getActivities(tokens) {
    let activities = []
    let filter = this.filter
    Object.keys(tokens).forEach(it => {
      let symbol = it.split(':')[0]
      let chain = it.split(':')[1] == 'NEO' ? 'assets/images/neo.png' : 'assets/images/eth.png'
      let data = {
        symbol,
        chain,
        lastPrice : 0,
        volume : 0,
        tokenName : tokens[it].name,
        usd : 0,
        change : 0,
        balance : 0,
      }
      if (tokens[it].usd) {
        let usd2 = tokens[it].usd[tokens[it].usd.length - 1]
        let usd1 = tokens[it].usd[tokens[it].usd.length - 2]
        data['change'] = (usd2.value - usd1.value)*100/usd1.value
        data['lastPrice'] = usd2.value
      }
      if (tokens[it].balances) {
        tokens[it].balances.forEach(jt => {
          let d = Object.assign({}, data)
          d['walletName'] = jt['walletName']
          d['balance'] = jt['balance']
          d['usd'] = jt['balance'] * data['lastPrice']
          activities.push(d)
        })
      }
    })
    activities.sort((a, b) => {
      return b['usd'] - a['usd']
    })
    activities = activities.filter(item => item.symbol.indexOf(filter))
    return activities
  }
  ngOnInit() {
  	// this.generateDate();
  }

  // generateDate = () => {
  // 	let alphabets = 'abcdefghijklmnopqrstuvwxyz_123456789'
  // 	for(let i = 0; i < 100; i++) {
  // 		let symbol = Math.random()<0.5 ? 'NEO' : 'ETH'
  // 		let chain;
  // 		let tokenName;
  // 		if (symbol == 'NEO') {
  // 			chain = 'assets/images/neo.png'
  // 			tokenName = 'NEO'
  // 		} else {
  // 			chain = 'assets/images/eth.png'
  // 			tokenName = 'Ethereum'
  // 		}
  // 		let walletName = ''
  // 		for(let j = 0; j<7;j++) {
  // 			let index = Math.round(Math.random() * (alphabets.length - 1))
  // 			walletName += alphabets[index]
  // 		}
  // 		let balance = Math.random() * 100
  // 		let lastPrice = Math.random() * 1000
  // 		let volume = Math.random() * 10000
  // 		let usd = Math.random() * 300
  // 		let change = (Math.random()<0.5 ? -1 : 1) * Math.random() * 100
  // 		var data = {
  // 			chain,
  // 			walletName,
  // 			tokenName,
  // 			symbol,
  // 			balance,
  // 			lastPrice,
  // 			volume,
  // 			usd,
  // 			change
  // 		}
  // 		this.activities[i] = data
  // 	}
  // }
}
