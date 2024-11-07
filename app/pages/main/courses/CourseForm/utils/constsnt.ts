  const tags = [
    { tagName: "React", _id: "1" },
    { tagName: "JavaScript", _id: "2" },
    { tagName: "CSS", _id: "3" },
    { tagName: "HTML", _id: "4" },
    { tagName: "Node.js", _id: "5" },
    { tagName: "Express", _id: "6" },
    { tagName: "MongoDB", _id: "7" },
    { tagName: "GraphQL", _id: "8" },
    { tagName: "TypeScript", _id: "9" },
    { tagName: "Redux", _id: "10" },
  ];

  export const courseTags = tags?.map((option: any) => ({
    label: option.tagName,
    value: option._id,
  }));


   export interface FormValues {
    title: string;
    benefits: string[];
    description: string;
    category: string;
    level: string;
    price: string;
    prerequisites: string;
    short_desc: string;
    language: string;
    tags: string[];
    duration: {
        hrs: string;
        min: string;
    };
    additional:string
  }