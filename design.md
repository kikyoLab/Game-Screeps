# Room
spawn energy ? cd ?

extension energy ?

link  energy ? cd ?

tower energy ? target.pos ? target.body ?

lab energy ? 矿物 ? cd ?

factory energy ? 矿物 ? cd ?

powerSpawn energy ? power ?

nuker energy ? 矿物 ? cd ?

observer room ?

storage store ?

terminal store ? cd ?

rampart hits ?

# Creep

## energy Handling

    miner => harvest from source to source
    upgrader => upgrad from controllerLink to controller
    transferStation => transfer from centerLink to storage and storage to spawn extension tower
    transshipmentCtr => transfer from storage and terminal to lab factory powerSpawn nuker
    repairman => repair from storage to rampart
    architect => build from storage to new structure

## room Guard

    repairman => repair from storage to rampart
    defender => attack creep
    defenseTower => attack creep or repair rampart
    transferStation => transfer from storage to tower

## attack

    warrior =>  target or tower spawn 
    priest => heal warrior
    offensiveAndDefensive => 攻防一体

## deposit powerBank harvest

    miner => harvest from terminal to deposit
    warrior => attack from spawn to powerBank
    priest => heal from spawn to warrior

    transportTruck => transfer from spawn to powerBank to terminal

## newRoom

    occupier => claim controller
    architect => build spawn and other structures

## outerMine

    miner => harvest from source to container
    transferStation => transfer from container to storage
    architect => build road container and 500tick to repair

# Structures

    storage overflow? 
    terminal overflow?  deal?  cd?  energy?
    spawn spawnCreep? cd? energy?
    tower energy? repair? heal? attack? search?
    extension energy?
    lab energy? 矿物? cd?
    factory energy? 矿物? cd?
    link energy? cd?
    powerSpawn energy? power? 
    rampart hits?
    powerBank power? ticksToDecay?
    deposit cooldown? ticksToDecay?

# Memory

## creeps

### energy Handling

    miner => source id pos
             link id pos

    upgrader => controller id pos
                link id pos

    transferStation => storage id pos
                       link id pos
                       spawn []
                       tower []
                       extension [] 

    transshipmentCtr => storage id pos
                        factory id pos
                        nuker id pos
                        powerSpawn id pos
                        lab []

    repairman => storage id pos
                 rampart []

    architect => storage id pos
                 structure []

### room Guard

    repairman => storage id pos
                 rampart []

    defender => creep id

    defenseTower => creep id 
                    rampart []

    transferStation => storage id pos
                       tower []

### attack

    warrior =>  target id pos
                spawn []
                tower[]

    priest => warrior id pos

    offensiveAndDefensive => target id pos []

### deposit powerBank harvest

    miner => terminal id pos
             deposit id pos

    warrior => powerBank id pos

    priest => warrior id pos

    transportTruck => terminal id pos
                      powerBank id pos

### newRoom

    occupier => controller id pos
    architect => source id 
                 structure []

### outerMine

    miner => source id pos
             container id pos

    transferStation => container id pos
                       storage id pos

    architect => road []
                 container id pos

## rooms

    structureTask

## spawns

    creepTask

## flags
