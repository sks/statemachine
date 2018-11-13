interface base {
    id: string,
    name: string;
    description: string;
}

export interface Step extends base {
    props: { [key: string]: string };
    metadata: { [key: string]: any };
    depends_on: string[];
}

export class Definition {
    steps: Array<Step>;
}
