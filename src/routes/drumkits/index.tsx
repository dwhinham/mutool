import { FunctionalComponent, h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import style from './style.css';
import _ from 'lodash';
import WebMidi, { Output } from "webmidi";

import * as DrumKitData from '../../xg_drum_kits.json';

interface Note {
    name: string;
    octave: number;
}

const NOTE_NAMES = [ "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B" ];

const noteNumberToNameAndOctave = (noteNumber: number): Note => {
    const name = NOTE_NAMES[noteNumber % 12];
    const octave = ~~(noteNumber / 12) - 2;
    return { name, octave };
}

const DrumKits: FunctionalComponent = () => {
    const [midiOut, setMidiOut] = useState<Output | undefined>(undefined);
    const [msb, setMSB] = useState(-1);
    const [lsb, setLSB] = useState(-1);
    const [program, setProgram] = useState(-1);

    const [showStdKitNames, setShowStdKitNames] = useState(false);
    const [showElements, setShowElements]  = useState(false);

    if (typeof window !== "undefined") {
        WebMidi.enable((err) => {
            if (err) {
                console.warn(err);
            } else {
                console.log("WebMIDI enabled");
                console.log(WebMidi.outputs);

                const output = WebMidi.getOutputByName("MU2000 MIDI 1");
                if (output !== false) {
                    setMidiOut(output);
                } else {
                    console.log("Couldn't find MU2000!");
                }
            }
        }, true);
    }

    const noteOn = (event: any) => {
        if (!midiOut) {
            console.log("no midi");
            return;
        }

        const note = DrumKitData.notes[event.target.dataset.note];
        const drumKit = DrumKitData.drum_kits[event.target.dataset.kit];
        let needsProgramChange = false;

        if (drumKit.msb !== msb) {
            midiOut.sendControlChange(0, drumKit.msb, 10);
            needsProgramChange = true;
            setMSB(drumKit.msb);
        }

        if (drumKit.lsb !== lsb) {
            midiOut.sendControlChange(32, drumKit.lsb, 10);
            needsProgramChange = true;
            setLSB(drumKit.lsb);
        }

        if (drumKit.program !== program) {
            needsProgramChange = true;
            setProgram(drumKit.program);
        }

        if (needsProgramChange) {
            midiOut.sendProgramChange(drumKit.program - 1, 10);
        }

        midiOut.playNote(note.number, 10);

        document.onmouseup = () => {
            noteOff(event);
            document.body.style.cursor = "default";
        }
    }

    const noteOff = (event: any) => {
        if (!midiOut) {
            console.log("no midi");
            return;
        }

        const note = DrumKitData.notes[event.target.dataset.note];
        midiOut.stopNote(note.number, 10);
        document.onmouseup = null;
    }

    const allSoundOff = () => {
        if (!midiOut) {
            console.log("no midi");
            return;
        }

        midiOut.sendChannelMode(120, 0);
    }

    const handleChange = (event: any) => {
        setShowElements(event.target.checked);
    }

    const handleChange2 = (event: any) => {
        setShowStdKitNames(event.target.checked);
    }

    return (
        <div class={style.home}>
            <div style={{display: 'flex', alignItems: "center"}}>
                <h1 style={{marginTop: '10px', marginBottom: '10px', flexGrow: "1"}}>Drum Kits</h1>
                {/* <ul>
                    <li>Current drum kit: {msb}, {lsb}, {program}</li>
                </ul>
                <button type="button" onClick={allSoundOff}>All Sound Off</button> */}

                <div style={{padding: '5px'}}>
                    <input id="showElements" type="checkbox" checked={showElements} onChange={handleChange} />
                    <label for="showElements">Show number of elements</label>
                    <input style={{marginLeft: "2rem"}} id="showStdKitNames" type="checkbox" checked={showStdKitNames} onChange={handleChange2} />
                    <label for="showStdKitNames">Show standard kit names</label>
                </div>
                </div>

                <div class={style.container}>
                <div class={style.scroll}>
                <table>
                    <colgroup>
                        <col span={4} />
                        { DrumKitData.drum_kits.map((drumKit: any) => <col key={drumKit.name} span={ showElements ? 2 : 1 } className="drumKit" />) }
                    </colgroup>

                    <thead>
                        <tr>
                            <th colSpan={4}>Bank Select MSB</th>
                            { DrumKitData.drum_kits.map((drumKit: any) => <td key={drumKit.name} className={style.center} colSpan={ showElements ? 2 : 1 }>{drumKit.msb}</td>) }
                        </tr>
                        <tr>
                            <th colSpan={4}>Bank Select LSB</th>
                            { DrumKitData.drum_kits.map((drumKit: any) => <td key={drumKit.name} className={style.center} colSpan={ showElements ? 2 : 1 }>{drumKit.lsb}</td>) }
                        </tr>
                        <tr>
                            <th colSpan={4}>Program #</th>
                            { DrumKitData.drum_kits.map((drumKit: any) => <td key={drumKit.name} className={style.center} colSpan={ showElements ? 2 : 1 }>{drumKit.program}</td>) }
                        </tr>

                        <tr>
                            <th>Note#</th>
                            <th>Note</th>
                            <th>Key Off</th>
                            <th>Alternate Group</th>

                            { DrumKitData.drum_kits.map((drumKit: any) => (
                                <Fragment key={drumKit.name}>
                                    <th>{drumKit.name}</th>
                                    { showElements && <th>E</th> }
                                </Fragment>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        { DrumKitData.notes.map((drumNote: any, noteIndex: number) => {
                            const note = noteNumberToNameAndOctave(drumNote.number);

                            return (
                                <tr key={drumNote.number}>
                                    <th className={style.center}>{drumNote.number}</th>
                                    <th>
                                        <div className={style.floatLeft}>{note.name}</div>
                                        <div className={style.floatRight}>{note.octave}</div>
                                    </th>
                                    { drumNote.key_off ? <td className={style.center}>○</td> : <td /> }
                                    <td className={style.center}>{drumNote.alt_group}</td>

                                    { DrumKitData.drum_kits.map((drumKit: any, drumKitIndex: number) => {
                                        const note = drumKit.notes[noteIndex];

                                        if (_.isNull(note)) {
                                            return (
                                                <Fragment key={drumKit.name}>
                                                    <td className={style.noSound} />
                                                    { showElements && <td className={style.noSound} /> }
                                                </Fragment>
                                            )
                                        }

                                        if (_.isEmpty(note)) {
                                            return (
                                                <Fragment key={drumKit.name}>
                                                    <td className={style.sameAsStdKit} data-kit={drumKitIndex} data-note={noteIndex} onMouseDown={noteOn}>{ showStdKitNames && DrumKitData.drum_kits[0].notes[noteIndex]?.name }</td>
                                                    { showElements && <td className={style.sameAsStdKit}>{ showStdKitNames && DrumKitData.drum_kits[0].notes[noteIndex]?.elements }</td> }
                                                </Fragment>
                                            )
                                        }

                                        return (
                                            <Fragment key={drumKit.name}>
                                                <td className={style.note} data-kit={drumKitIndex} data-note={noteIndex} onMouseDown={noteOn}>{note.name}</td>
                                                { showElements && <td>{note.elements}</td> }
                                            </Fragment>
                                        )
                                    })}
                                </tr>
                            )
                        }) }
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
};

export default DrumKits;
