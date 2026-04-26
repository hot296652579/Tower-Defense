import { SkillData } from "../../game/skill/SkillData"

export class SkillComp {
    isCasting:boolean = false;

    currentSkill:String = '';
    skills: Map<string, SkillData> = new Map()
    cooldown: Map<string, number> = new Map()

}