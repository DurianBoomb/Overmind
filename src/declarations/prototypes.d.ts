interface Creep {
	memory: CreepMemory;
	boosts: _ResourceConstantSansEnergy[];
	boostCounts: { [boostType: string]: number };
	travelTo(destination: RoomPosition | { pos: RoomPosition }, options?: any): number;
}

interface Flag {
	// recalculateColony(restrictDistance?: number): void;
}

type Sink = StructureSpawn |
	StructureExtension |
	StructureLab |
	StructurePowerSpawn |
	StructureNuker |
	StructureTower;
type StorageUnit = StructureContainer | StructureTerminal | StructureStorage;

interface Room {
	print: string;
	my: boolean;
	reservedByMe: boolean;
	signedByMe: boolean;
	creeps: Creep[];
	hostiles: Creep[];
	playerHostiles: Creep[];
	hostileStructures: Structure[];
	flags: Flag[];
	// Preprocessed structures
	tombstones: Tombstone[];
	drops: { [resourceType: string]: Resource[] };
	droppedEnergy: Resource[];
	droppedMinerals: Resource[];
	droppedPower: Resource[];
	structures: { [structureType: string]: Structure[] };
	spawns: StructureSpawn[];
	extensions: StructureExtension[];
	containers: StructureContainer[];
	storageUnits: StorageUnit[];
	towers: StructureTower[];
	links: StructureLink[];
	labs: StructureLab[];
	sources: Source[];
	roads: StructureRoad[];
	// sinks: Sink[];
	repairables: Structure[];
	constructionSites: ConstructionSite[];
	structureSites: ConstructionSite[];
	roadSites: ConstructionSite[];
	barriers: (StructureWall | StructureRampart)[];

	getStructures(structureType: string): Structure[];

}

interface RoomObject {
	ref: string;
	targetedBy: string[];
	linked: boolean;
	nearbyLinks: StructureLink[];

	// isTargetFor(taskName?: string): ITask[];

	serialize(): protoRoomObject;
}

interface RoomPosition {
	print: string;
	name: string;
	coordName: string;
	isEdge: boolean;
	isVisible: boolean;
	rangeToEdge: number;
	roomCoords: Coord;
	neighbors: RoomPosition[];
	// adjacentSpots: RoomPosition[];
	// availableAdjacentSpots: RoomPosition[];

	lookForStructure(structureType: StructureConstant): Structure | undefined;

	isPassible(ignoreCreeps?: boolean): boolean;

	availableNeighbors(ignoreCreeps?: boolean): RoomPosition[];

	getPositionAtDirection(direction: DirectionConstant, range?: number): RoomPosition;

	getMultiRoomRangeTo(pos: RoomPosition): number;

	findClosestByLimitedRange<T>(objects: T[] | RoomPosition[], rangeLimit: number,
								 opts?: { filter: any | string; }): T;

	findClosestByMultiRoomRange<T extends _HasRoomPosition>(objects: T[], opts?: { filter: any | string; }): T;
}

interface RoomVisual {
	infoBox(info: string[], x: number, y: number, opts?: { [option: string]: any }): RoomVisual;

	multitext(textLines: string[], x: number, y: number, opts?: { [option: string]: any }): RoomVisual;

	structure(x: number, y: number, type: string, opts?: { [option: string]: any }): RoomVisual;

	connectRoads(opts?: { [option: string]: any }): RoomVisual | void;

	speech(text: string, x: number, y: number, opts?: { [option: string]: any }): RoomVisual;

	animatedPosition(x: number, y: number, opts?: { [option: string]: any }): RoomVisual;

	test(): RoomVisual;
}

interface Structure {
	blocksMovement: boolean;
}

interface StructureContainer {
	energy: number;
	isFull: boolean;
	isEmpty: boolean;
}

interface StructureController {
	reservedByMe: boolean;
	signedByMe: boolean;
	signedByScreeps: boolean;

	needsReserving(reserveBuffer: number): boolean;
}

interface StructureExtension {
	isFull: boolean;
	isEmpty: boolean;
}

interface StructureLab {
	getMineralType(): _ResourceConstantSansEnergy | undefined;
}

interface StructureLink {
	isFull: boolean;
	isEmpty: boolean;
}

interface StructureStorage {
	energy: number;
	isFull: boolean;
	isEmpty: boolean;

}

interface StructureSpawn {
	isFull: boolean;
	isEmpty: boolean;

	cost(bodyArray: string[]): number;

}

interface StructureTerminal {
	energy: any;
	isFull: boolean;
	isEmpty: boolean;
	// _send(resourceType: ResourceConstant, amount: number, destination: string, description?: string): ScreepsReturnCode;
}

interface StructureTower {
	isFull: boolean;
	isEmpty: boolean;

	// run(): void;
	//
	// attackNearestEnemy(): number;
	//
	// healNearestAlly(): number;
	//
	// repairNearestStructure(): number;
	//
	// preventRampartDecay(): number;
}

interface Tombstone {
	energy: number;
}

interface String {
	padRight(length: number, char?: string): string;

	padLeft(length: number, char?: string): string;
}

interface Number {
	toPercent(decimals?: number): string;
}
