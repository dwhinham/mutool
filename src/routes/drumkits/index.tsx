import { FunctionalComponent, h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import style from './style.css';
import _ from 'lodash';
import WebMidi, { InputEventNoteon, MidiControlChangeMessages, Output } from "webmidi";

import DrumKitData from '../../xg_drum_kits';

const DrumKits: FunctionalComponent = () => {
    const [midiOut, setMidiOut] = useState(undefined);
    const [msb, setMSB] = useState(-1);
    const [lsb, setLSB] = useState(-1);
    const [program, setProgram] = useState(-1);

    const showStdKitNames = false;
    const showElements = false;

    // const onMIDISuccess = (midiAccess: any) => {
    //     const inputs = midiAccess.inputs;
    //     const outputs = midiAccess.outputs;

    //     for (let output of outputs.values()) {
    //         console.log(output);
    //     }
    // }

    // const onMIDIFailure = () => {
    //     console.log('Could not access your MIDI devices.');
    // }

    // navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

    WebMidi.enable((err) => {
        if (err) {
            console.warn(err);
        } else {
            console.log("WebMIDI enabled");
            console.log(WebMidi.outputs);

            setMidiOut(WebMidi.outputs[0]);
        }
    }, true);

    const auditionNote = (event: any) => {
        if (!midiOut) {
            console.log("no midi");
            return;
        }

        const note = DrumKitData.notes[event.target.attributes["noteindex"].value];
        const drumKit = DrumKitData.drum_kits[event.target.attributes["drumkitindex"].value];

        if (drumKit.msb !== msb) {
            midiOut.sendControlChange(0, drumKit.msb, 10);
            setMSB(drumKit.msb);
        }

        if (drumKit.lsb !== lsb) {
            midiOut.sendControlChange(32, drumKit.lsb, 10);
            setLSB(drumKit.lsb);
        }

        if (drumKit.program !== program) {
            midiOut.sendProgramChange(drumKit.program, 10);
            setProgram(drumKit.program);
        }

        midiOut.playNote(note.number, 10);
    }

    return (
        <div class={style.home}>
            <h1>Drum Kits</h1>
            <ul>
                <li>Current drum kit: {msb}, {lsb}, {program}</li>
            </ul>
            <table>
                <tr>
                    <th colSpan={4}>Bank Select MSB</th>
                    { DrumKitData.drum_kits.map((drumKit: any) => <td className={style.center} colSpan={ showElements ? 2 : 1 }>{drumKit.msb}</td>) }
                </tr>
                <tr>
                    <th colSpan={4}>Bank Select LSB</th>
                    { DrumKitData.drum_kits.map((drumKit: any) => <td className={style.center} colSpan={ showElements ? 2 : 1 }>{drumKit.lsb}</td>) }
                </tr>
                <tr>
                    <th colSpan={4}>Program #</th>
                    { DrumKitData.drum_kits.map((drumKit: any) => <td className={style.center} colSpan={ showElements ? 2 : 1 }>{drumKit.program}</td>) }
                </tr>

                <tr>
                    <th>Note#</th>
                    <th>Note</th>
                    <th>Key Off</th>
                    <th>Alternate Group</th>

                    { DrumKitData.drum_kits.map((drumKit: any) => (
                        <Fragment>
                            <th>{drumKit.name}</th>
                            { showElements && <th>E</th> }
                        </Fragment>
                    ))}
                </tr>

                { DrumKitData.notes.map((note: any, noteIndex: number) => (
                    <tr>
                        <td className={style.center}>{note.number}</td>
                        <td className={style.center}>{note.name}</td>
                        <td className={style.center}>{note.key_off ? "○" : ""}</td>
                        <td className={style.center}>{note.alt_group}</td>

                        { DrumKitData.drum_kits.map((drumKit: any, drumKitIndex: number) => {
                            const note = drumKit.notes[noteIndex];

                            if (_.isNull(note)) {
                                return (
                                    <Fragment>
                                        <td className={style.noSound}></td>
                                        { showElements && <td className={style.noSound}></td> }
                                    </Fragment>
                                )
                            }

                            if (_.isEmpty(note)) {
                                return (
                                    <Fragment>
                                        <td className={style.sameAsStdKit} drumKitIndex={drumKitIndex} noteIndex={noteIndex} onClick={auditionNote}>{ showStdKitNames && DrumKitData.drum_kits[0].notes[noteIndex].name }</td>
                                        { showElements && <td className={style.sameAsStdKit}>{ showStdKitNames && DrumKitData.drum_kits[0].notes[noteIndex].elements }</td> }
                                    </Fragment>
                                )
                            }

                            return (
                                <Fragment>
                                    <td className={style.note} drumKitIndex={drumKitIndex} noteIndex={noteIndex} onClick={auditionNote}>{note.name}</td>
                                    { showElements && <td>{note.elements}</td> }
                                </Fragment>
                            )
                        })}
                    </tr>
                )) }
            </table>
        </div>
    );
};

export default DrumKits;
