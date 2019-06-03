#!/bin/bash

# Generate Files #
## Features ##
for feature in src/features/*; do
    rm -rf $feature/api.sdkgen
    touch $feature/api.sdkgen

    echo "// GENERATED FILE" >> $feature/api.sdkgen
    echo "// GENERATED FILE" >> $feature/api.sdkgen
    echo "// GENERATED FILE" >> $feature/api.sdkgen
    echo "" >> $feature/api.sdkgen
    echo "// Shared" >> $feature/api.sdkgen
    echo "import \"../../shared/shared\"" >> $feature/api.sdkgen
    echo "" >> $feature/api.sdkgen

    echo "// Internal" >> $feature/api.sdkgen
    for target in $feature/*.sdkgen; do
        targetName=$(basename $target | cut -d . -f 1)
        if [ $targetName != "api" ]; then
            echo "import \"$targetName\"" >> $feature/api.sdkgen
        fi
    done

    echo "" >> $feature/api.sdkgen
    echo "// GENERATED FILE" >> $feature/api.sdkgen
    echo "// GENERATED FILE" >> $feature/api.sdkgen
    echo "// GENERATED FILE" >> $feature/api.sdkgen
    echo "" >> $feature/api.sdkgen
done

for feature in src/features/*; do
    featureName=$(basename $feature)

    echo "Generating files for Feature $featureName"
    ./sdkgen $feature/api.sdkgen -o $feature/types.ts -t typescript_objects
    ./sdkgen $feature/api.sdkgen -o $feature/error.ts -t typescript_error
done

## Targets ##
for target in src/targets/*; do
    if [ -f $target/api.sdkgen ]; then
        targetName=$(basename $target)
        targetTitle=$(echo "$(tr '[:lower:]' '[:upper:]' <<< ${targetName:0:1})${targetName:1}")

        echo "Generating features.sdkgen for $targetName"
        rm -rf $target/features.sdkgen
        touch $target/features.sdkgen

        echo "// GENERATED FILE" >> $target/features.sdkgen
        echo "// GENERATED FILE" >> $target/features.sdkgen
        echo "// GENERATED FILE" >> $target/features.sdkgen
        echo "" >> $target/features.sdkgen

        for feature in src/features/*; do
            if [ -f "$feature/$targetName.sdkgen" ]; then
                importPath=$(echo "${feature//src/}" | cut -d . -f 1)
                echo "import \"../..$importPath/$targetName\"" >> $target/features.sdkgen
            fi
            if [ -f "$feature/shared.sdkgen" ]; then
                importPath=$(echo "${feature//src/}" | cut -d . -f 1)
                echo "import \"../..$importPath/shared\"" >> $target/features.sdkgen
            fi
        done

        echo "" >> $target/features.sdkgen
        echo "// GENERATED FILE" >> $target/features.sdkgen
        echo "// GENERATED FILE" >> $target/features.sdkgen
        echo "// GENERATED FILE" >> $target/features.sdkgen

        echo "Generating format.ts for $targetName"
        rm -rf $target/format.ts
        touch $target/format.ts

        echo "// GENERATED FILE" >> $target/format.ts
        echo "// GENERATED FILE" >> $target/format.ts
        echo "// GENERATED FILE" >> $target/format.ts
        echo "" >> $target/format.ts

        echo "export * from  \"../../shared/format\";" >> $target/format.ts
        for feature in src/features/*; do
            if [ -f "$feature/format.ts" ]; then
                importPath=$(echo "${feature//src/}")
                echo "export * from  \"../..$importPath/format\";" >> $target/format.ts
            fi
            if [ -f "$feature/format$targetName.ts" ]; then
                importPath=$(echo "${feature//src/}")
                echo "export * from  \"../..$importPath/format$targetTitle\";" >> $target/format.ts
            fi
        done

        echo "" >> $target/format.ts
        echo "// GENERATED FILE" >> $target/format.ts
        echo "// GENERATED FILE" >> $target/format.ts
        echo "// GENERATED FILE" >> $target/format.ts
    fi
done

for target in src/targets/*; do
    if [ -f $target/api.sdkgen ]; then
        targetName=$(basename $target)
        echo "Generating files for Target $targetName"

        ./sdkgen $target/api.sdkgen -o $target/api.ts -t typescript_nodeserver
        ./sdkgen $target/api.sdkgen -o $target/client.ts -t typescript_nodeclient
    fi
done

## Shared ##
echo "Generating Shared files"
./sdkgen src/shared/shared.sdkgen -o src/shared/types.ts -t typescript_objects
./sdkgen src/shared/shared.sdkgen -o src/shared/error.ts -t typescript_error

## General ##
echo "Generating Global files"
echo "// GENERATED FILE" > src/all.sdkgen
echo "// GENERATED FILE" >> src/all.sdkgen
echo "// GENERATED FILE" >> src/all.sdkgen
echo "" >> src/all.sdkgen
for feature in src/features/*; do
    featureName=$(basename $feature)

    echo "import \"./features/$featureName/api\"" >> src/all.sdkgen
done
echo "" >> src/all.sdkgen
echo "// GENERATED FILE" >> src/all.sdkgen
echo "// GENERATED FILE" >> src/all.sdkgen
echo "// GENERATED FILE" >> src/all.sdkgen
echo "" >> src/all.sdkgen

./sdkgen src/all.sdkgen -o src/types.ts -t typescript_objects
rm -rf src/all.sdkgen

bash clients.sh
