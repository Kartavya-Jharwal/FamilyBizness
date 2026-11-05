import { useState, createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { RollingNumberInput, nextNumberStep } from "@fb/ui/components/ui/rolling-number-input";
import { Input } from "@fb/ui/components/ui/input";
import { MoneyInput } from "@fb/ui/components/financial/money-input";
import { FormattingProvider } from "@fb/ui/components/formatting-provider";
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
it("submits large signed decimal numbers through the same real input and forwarded ref",()=>{
 const ref=createRef<HTMLInputElement>();function Form(){const[value,setValue]=useState(-8000000.25);return <form aria-label="Model"><label>Capital<Input ref={ref} name="capital" type="number" step="0.25" value={value} onChange={e=>setValue(e.target.valueAsNumber)}/></label></form>;}
 render(<Form/>);fireEvent.click(screen.getByRole("button",{name:"Increase Capital"}));expect(ref.current?.valueAsNumber).toBe(-8000000);expect(new FormData(screen.getByRole("form") as HTMLFormElement).get("capital")).toBe("-8000000");
 fireEvent.change(screen.getByRole("spinbutton",{name:"Capital"}),{target:{value:"12430000.5"}});expect(ref.current?.valueAsNumber).toBe(12430000.5);
});
it("honours min/max and step, disabled state, keyboard and required validation",()=>{
 const {rerender}=render(<RollingNumberInput aria-label="Allocation" name="weight" defaultValue={95} min={0} max={100} step={5} required/>);
 fireEvent.click(screen.getByRole("button",{name:"Increase Allocation"}));expect(screen.getByRole("spinbutton")).toHaveValue(100);expect(screen.getByRole("button",{name:"Increase Allocation"})).toBeDisabled();
 fireEvent.keyDown(screen.getByRole("spinbutton"),{key:"ArrowDown"});expect(screen.getByRole("spinbutton")).toHaveValue(95);
 fireEvent.change(screen.getByRole("spinbutton"),{target:{value:""}});expect((screen.getByRole("spinbutton")as HTMLInputElement).validity.valueMissing).toBe(true);
 rerender(<RollingNumberInput key="disabled" aria-label="Allocation" value={30} disabled/>);expect(screen.getAllByRole("button").every(button=>(button as HTMLButtonElement).disabled)).toBe(true);
});
it("holds to repeat and cancels when the pointer leaves, without a second release click",()=>{
 vi.useFakeTimers();render(<RollingNumberInput aria-label="Years" defaultValue={10} min={0} max={50}/>);
 vi.stubGlobal("PointerEvent",MouseEvent);const plus=screen.getByRole("button",{name:"Increase Years"});fireEvent.pointerDown(plus,{button:0});act(()=>vi.advanceTimersByTime(560));expect(screen.getByRole("spinbutton")).toHaveValue(13);
 fireEvent.pointerLeave(plus);act(()=>vi.advanceTimersByTime(500));expect(screen.getByRole("spinbutton")).toHaveValue(13);fireEvent.click(plus);expect(screen.getByRole("spinbutton")).toHaveValue(13);
});
it("drags the dial using the form step and keeps a normal typing fallback",()=>{
 vi.stubGlobal("PointerEvent",MouseEvent);document.documentElement.style.setProperty("--design-number-drag-notch","10");render(<RollingNumberInput aria-label="Rate" defaultValue={5} step={0.5} min={0} max={12}/>);
 const dial=document.querySelector(".rolling-number-display")!;fireEvent.pointerDown(dial,{clientY:100,button:0});fireEvent.pointerMove(dial,{clientY:70});fireEvent.pointerUp(dial,{clientY:70});expect(screen.getByRole("spinbutton")).toHaveValue(6.5);
 fireEvent.change(screen.getByRole("spinbutton"),{target:{value:"7.25"}});expect(screen.getByRole("spinbutton")).toHaveValue(7.25);
});
it("preserves locale parsing and cents in the existing formatted money input",()=>{
 function Money(){const[value,setValue]=useState<number|undefined>(1234.56);return <FormattingProvider locale="de-DE" timezone="Europe/London"><MoneyInput aria-label="Reserve" name="reserve" value={value} thousandSeparator onValueChange={setValue}/><output>{value}</output></FormattingProvider>;}
 render(<Money/>);fireEvent.click(screen.getByRole("button",{name:"Increase Reserve"}));expect(screen.getByRole("textbox",{name:"Reserve"})).toHaveValue("1.235,56");expect(screen.getByText("1235.56",{selector:"output"})).toBeInTheDocument();
});
it("uses finite stepped values without floating point drift",()=>{
 expect(nextNumberStep(0.2,1,0.1,0,1)).toBe(0.3);expect(nextNumberStep(100,-1,5,0,150)).toBe(95);expect(nextNumberStep(-0.2,-1,0.1,-1,1)).toBe(-0.3);
});
