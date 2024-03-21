import {Component, NgZone, OnInit} from '@angular/core';
import {SavedWalletsService} from '../../services/saved-wallets.service';
import {MarketBroadcastService} from '../../services/market-broadcast.service';

@Component({
  selector: 'app-stake-container',
  templateUrl: './stake-container.component.html',
  styleUrls: ['./stake-container.component.css']
})
export class StakeContainerComponent implements OnInit {

  public selectedExchange : any = "";
  public selectedWallet : any = "";
  private marketBroadcastServiceSub : any;
  constructor(
    private marketBroadcastService : MarketBroadcastService,
    private savedWalletsService: SavedWalletsService,
    private zone : NgZone
  ) {}

  ngOnInit(): void {

    this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        let w = this.savedWalletsService.getCurrentWallet();
        this.selectedWallet = w
      }
    });
    this.marketBroadcastServiceSub = this.marketBroadcastService.marketStatus$.subscribe(status => {
      if (status == 'exchangeWillChange') {
        this.selectedExchange = this.marketBroadcastService.getSelectedExchange()
      }
    });
  }

  ngOnDestroy(): void {
  }

}
