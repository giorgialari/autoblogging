import { Component, HostListener } from '@angular/core';
import { from } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { WpService } from 'src/app/services/wp.service';
import { FunctionsService } from 'src/app/utils/functions/amazon/functions.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-pillar',
  templateUrl: './pillar.component.html',
  styleUrls: ['./pillar.component.scss']
})
export class PillarComponent {

}
