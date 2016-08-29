import * as Promise from 'bluebird';
import * as async from 'async';
import ModEastron from "modbus-eastron"


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


export default function ModMultiEastron(devices: EastronDevice[]) {

    return new Promise((resolve, reject) => {

        if (devices && devices.length && devices[0] && devices[0].id) {

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

        } else {
            reject('wrong data conf for modbus multiple eastron')
        }

    })

}