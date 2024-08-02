import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FlexHeadComponent } from '../../gauges/gauge-property/flex-head/flex-head.component';
import { FlexAuthComponent } from '../../gauges/gauge-property/flex-auth/flex-auth.component';
import { TranslateService } from '@ngx-translate/core';
import { AlarmProperty, AlarmAckMode, AlarmSubProperty, AlarmSubActions, AlarmAction, AlarmActionsType } from '../../_models/alarm';

@Component({
    selector: 'app-alarm-property',
    templateUrl: './alarm-property.component.html',
    styleUrls: ['./alarm-property.component.css']
})
export class AlarmPropertyComponent {

	@ViewChild('flexauth', {static: false}) flexAuth: FlexAuthComponent;
    @ViewChild('flexhead', {static: false}) flexHead: FlexHeadComponent;

    property: AlarmProperty;
    ackMode = AlarmAckMode;
    actionsType = AlarmActionsType;
    actionPopup = Object.keys(AlarmActionsType).find(key => AlarmActionsType[key] === AlarmActionsType.popup);
    actionSetView = Object.keys(AlarmActionsType).find(key => AlarmActionsType[key] === AlarmActionsType.setView);
    actionSetValue = Object.keys(AlarmActionsType).find(key => AlarmActionsType[key] === AlarmActionsType.setValue);
    // actionSendMsg = Object.keys(AlarmActionsType).find(key => AlarmActionsType[key] === AlarmActionsType.sendMsg);

    errorExist = false;
    errorMissingValue = false;
    existnames = [];
    existtexts = [];
    existgroups = [];

    constructor(
        public dialogRef: MatDialogRef<AlarmPropertyComponent>,
        private translateService: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        if (this.data.alarm.property) {
           this.property = <AlarmProperty>JSON.parse(JSON.stringify(this.data.alarm.property));
        } else {
            this.property = new AlarmProperty();
        }
        if (!this.data.alarm.highhigh) {
            this.data.alarm.highhigh = new AlarmSubProperty();
            this.data.alarm.highhigh.bkcolor = '#FF4848';
            this.data.alarm.highhigh.color = '#FFF';
            this.data.alarm.highhigh.enabled = false;
            this.data.alarm.highhigh.ackmode = <AlarmAckMode>Object.keys(AlarmAckMode)[Object.values(AlarmAckMode).indexOf(AlarmAckMode.ackactive)];
        }
        if (!this.data.alarm.high) {
            this.data.alarm.high = new AlarmSubProperty();
            this.data.alarm.high.bkcolor = '#F9CF59';
            this.data.alarm.high.color = '#000';
            this.data.alarm.high.enabled = false;
            this.data.alarm.high.ackmode = <AlarmAckMode>Object.keys(AlarmAckMode)[Object.values(AlarmAckMode).indexOf(AlarmAckMode.ackactive)];
            // this.data.alarm.info = new AlarmSubProperty();
        }
        if (!this.data.alarm.low) {
            this.data.alarm.low = new AlarmSubProperty();
            this.data.alarm.low.bkcolor = '#E5E5E5';
            this.data.alarm.low.color = '#000';
            this.data.alarm.low.enabled = false;
            this.data.alarm.low.ackmode = <AlarmAckMode>Object.keys(AlarmAckMode)[Object.values(AlarmAckMode).indexOf(AlarmAckMode.ackactive)];
        }
        if (!this.data.alarm.info) {
            this.data.alarm.info = new AlarmSubProperty();
            this.data.alarm.info.bkcolor = '#22A7F2';
            this.data.alarm.info.color = '#FFF';
            this.data.alarm.info.enabled = false;
            this.data.alarm.info.ackmode = <AlarmAckMode>Object.keys(AlarmAckMode)[Object.values(AlarmAckMode).indexOf(AlarmAckMode.float)];
        }
        if (!this.data.alarm.actions) {
            this.data.alarm.actions = new AlarmSubActions();
            this.data.alarm.actions.enabled = false;
        }

        Object.keys(this.ackMode).forEach(key => {
            this.translateService.get(this.ackMode[key]).subscribe((txt: string) => { this.ackMode[key] = txt; });
        });
        Object.keys(this.actionsType).forEach(key => {
            this.translateService.get(this.actionsType[key]).subscribe((txt: string) => { this.actionsType[key] = txt; });
        });
        if (data.alarms) {
            this.existnames = data.alarms.filter(a => a.name !== data.alarm.name);
            data.alarms.forEach(item => {
                if (item.highhigh.text && this.existtexts.indexOf(item.highhigh.text) === -1) {this.existtexts.push(item.highhigh.text);}
                if (item.high.text && this.existtexts.indexOf(item.high.text) === -1) {this.existtexts.push(item.high.text);}
                if (item.low.text && this.existtexts.indexOf(item.low.text) === -1) {this.existtexts.push(item.low.text);}
                if (item.info.text && this.existtexts.indexOf(item.info.text) === -1) {this.existtexts.push(item.info.text);}

                if (item.highhigh.group && this.existgroups.indexOf(item.highhigh.group) === -1) {this.existgroups.push(item.highhigh.group);}
                if (item.high.group && this.existgroups.indexOf(item.high.group) === -1) {this.existgroups.push(item.high.group);}
                if (item.low.group && this.existgroups.indexOf(item.low.group) === -1) {this.existgroups.push(item.low.group);}
                if (item.info.group && this.existgroups.indexOf(item.info.group) === -1) {this.existgroups.push(item.info.group);}
            });
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        if (this.data.editmode < 0) {
            this.dialogRef.close(this.data.alarm);
        } else if (this.checkValid()) {
            this.data.alarm.property = this.property;
            this.data.alarm.property.permission = this.flexAuth.permission;
            this.data.alarm.name = this.flexAuth.name;
            this.dialogRef.close(this.data.alarm);
        }
    }

    checkValid() {
        this.errorMissingValue = !this.flexAuth.name;
        this.errorExist = (this.existnames.find((a) => a.name === this.flexAuth.name)) ? true : false;
        return !(this.errorMissingValue || this.errorExist);
    }

    onAddAction() {
        let act = new AlarmAction();
        this.data.alarm.actions.values.push(act);
    }

    onAlarmAction(index: number) {
        this.data.alarm.actions.values.splice(index, 1);
    }

    setActionVariable(action: AlarmAction, event) {
        action.variableId = event.variableId;
    }
}
