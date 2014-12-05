///<reference path='typings/cheerio/cheerio.d.ts'/>


export class AbstractElement {
}

export interface IScanner {
    getSelector(): any
    getEvaluator(): any
}


export class Scanner<T extends AbstractElement> implements IScanner{
    select(): string {
        return document.documentElement.innerHTML
    }

    evaluate(domString: string): T[]{
        throw "evaluate function is not overrided"
    }

    getSelector(): any {
        return this.select;
    }

    getEvaluator(): any {
        return this.evaluate;
    }

}

export class InBrowserScanner<T extends AbstractElement> implements IScanner {
    evaluate(domString: string): any[]{
        throw "evaluate function is not overrided"
    }

    objectToElement(objects: any[]): T[] {
        throw "objectToElement function is not overrided"
    }

    getSelector(): any {
        return this.evaluate;
    }

    getEvaluator(): any {
        return this.objectToElement;
    }

}
