import * as Promise from 'bluebird';
import * as async from 'async';
import ModEastron from "modbus-eastron"
import afterSync from "aftertimesync"



interface EastronDevice {
    dev?: string;
    hub?: string;
    baud: number;
    id: number;
    uid?: string;
    model: string;
    className?: string;
    direction: string;
}


export default class ModEastronKernel {
    devices: EastronDevice[]
    activeloop: any;


    constructor() {
        this.devices = []
    }

    addDevices(devices: EastronDevice[]) {
        if (!devices || !devices.length || !devices[0].id) {
            throw Error('wrong devices config for kernel modbus eastron')
        } else {

            for (let i = 0; i < devices.length; i++) {
                this.addDevice(devices[i])
            }

        }

    }

    addDevice(device: EastronDevice) {
        if (!device || !device.id) {
            throw Error('wrong device conf for kernel modbus eastron')
        } else {
            this.devices.push(device)
        }

    }


    loop(callback: Function, o?: { interval: number, checkTime: boolean }) {

        const _this = this;
        if (!_this.activeloop) {


            function looping() {
                let interval = 300000
                if (o && o.interval) interval = o.interval


                function cycle() {
                    _this.activeloop = setInterval(function () {
                        this.data().then((a) => {
                            callback(a)
                        }).catch((err) => {
                            console.error(err)
                        })
                    }, interval)
                }




                this.data().then((a) => {
                    callback(a)
                    cycle()
                }).catch((err) => {
                    console.error(err)
                    cycle()
                })


            }

            if (o && o.checkTime) {
                afterSync().then(() => {
                    looping()
                }).catch((err) => {
                    console.error(err)
                    throw Error(err)
                })
            } else {
                looping()
            }



        } else {
            throw Error('you must close the actual loop before start another')
        }

    }

    loopStop() {

        const _this = this;
        if (_this.activeloop) {
            clearInterval(_this.activeloop)
            return 'ok'
        } else {
            return 'no loop are running'
        }

    }

    data() {
        const devices = this.devices
        return new Promise((resolve, reject) => {

            const answer = [];

            async.eachSeries(devices, (device) => {

                ModEastron(device).then((a) => {
                    answer.push(a)
                }).catch((err) => {
                    console.error(err)
                })

            }, (err) => {

                if (err) {
                    reject(err)

                } else {
                    resolve(answer)
                }

            })

        })
    }


}