import { promises as fsPromises } from 'fs';
import * as path from "path";
import { Blocks } from './MyTypes';

export async function blockChecker(id: number) {
    if (!id) {
        throw new Error("th id is falsy value!");
    }
    try {
        const fileContent = await fsPromises.readFile("blocks.json", "utf-8");
        const jsonContent: Blocks = JSON.parse(fileContent);
        const result = jsonContent.blocks.find(item => item === id);
        return result;
    }
    catch (error: any) {
        console.log("an error occur")
        throw new Error(error);
    }
}


export async function addBlock(id: number) {
    try {
        const fileContent = await fsPromises.readFile("blocks.json", "utf-8");
        const jsonContent: Blocks = JSON.parse(fileContent);
        jsonContent.blocks.push(id);
        await fsPromises.writeFile("blocks.json", JSON.stringify(jsonContent));
        return true;
    }
    catch (error: any) {
        console.log("an error occur")
        throw new Error(error);
    }
}
